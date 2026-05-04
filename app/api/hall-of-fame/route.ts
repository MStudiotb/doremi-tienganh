/**
 * API Routes for Hall of Fame
 * Get featured entries, add likes, add comments
 */

import { NextRequest, NextResponse } from "next/server"
import { getMongoClient } from "@/lib/mongodb"
import { HallOfFameEntry, HallOfFameComment } from "@/lib/mongodb-collections"
import { ObjectId } from "mongodb"

// GET: Fetch Hall of Fame entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const week = searchParams.get("week")
    const year = searchParams.get("year")

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const hallOfFameCollection = db.collection<HallOfFameEntry>("hallOfFame")

    let query: any = {}
    if (week) query.week = parseInt(week)
    if (year) query.year = parseInt(year)

    const entries = await hallOfFameCollection
      .find(query)
      .sort({ featuredAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({ success: true, entries })
  } catch (error) {
    console.error("Error fetching Hall of Fame:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch Hall of Fame" },
      { status: 500 }
    )
  }
}

// POST: Add like or comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, entryId, userId, userName, userAvatar, content } = body

    if (!action || !entryId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const hallOfFameCollection = db.collection<HallOfFameEntry>("hallOfFame")

    const entry = await hallOfFameCollection.findOne({
      _id: new ObjectId(entryId),
    })

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Entry not found" },
        { status: 404 }
      )
    }

    if (action === "like") {
      // Toggle like
      const likes = entry.likes || []
      const hasLiked = likes.includes(userId)

      if (hasLiked) {
        // Unlike
        await hallOfFameCollection.updateOne(
          { _id: new ObjectId(entryId) },
          { $pull: { likes: userId } }
        )
      } else {
        // Like
        await hallOfFameCollection.updateOne(
          { _id: new ObjectId(entryId) },
          { $addToSet: { likes: userId } }
        )

        // Notify the entry owner
        if (entry.userId !== userId) {
          const notificationsCollection = db.collection("notifications")
          await notificationsCollection.insertOne({
            userId: entry.userId,
            type: "like",
            title: "❤️ Ai đó đã thích bài viết của bạn!",
            message: `${userName} đã thích bài thi xuất sắc của bạn trên Bảng Vàng!`,
            icon: "/dau chan.png",
            link: "/hall-of-fame",
            isRead: false,
            createdAt: new Date(),
          })
        }
      }

      return NextResponse.json({
        success: true,
        liked: !hasLiked,
        message: hasLiked ? "Unliked" : "Liked",
      })
    } else if (action === "comment") {
      if (!content) {
        return NextResponse.json(
          { success: false, error: "Comment content is required" },
          { status: 400 }
        )
      }

      const newComment: HallOfFameComment = {
        id: new ObjectId().toString(),
        userId,
        userName,
        userAvatar,
        content,
        createdAt: new Date(),
      }

      await hallOfFameCollection.updateOne(
        { _id: new ObjectId(entryId) },
        { $push: { comments: newComment } }
      )

      // Notify the entry owner
      if (entry.userId !== userId) {
        const notificationsCollection = db.collection("notifications")
        await notificationsCollection.insertOne({
          userId: entry.userId,
          type: "comment",
          title: "💬 Bình luận mới!",
          message: `${userName} đã bình luận về bài thi xuất sắc của bạn: "${content.substring(0, 50)}..."`,
          icon: "/chuong.png",
          link: "/hall-of-fame",
          isRead: false,
          createdAt: new Date(),
        })
      }

      return NextResponse.json({
        success: true,
        comment: newComment,
        message: "Comment added successfully",
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error processing Hall of Fame action:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process action" },
      { status: 500 }
    )
  }
}

// DELETE: Remove comment (only by comment owner or admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get("entryId")
    const commentId = searchParams.get("commentId")
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")

    if (!entryId || !commentId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const hallOfFameCollection = db.collection<HallOfFameEntry>("hallOfFame")

    const entry = await hallOfFameCollection.findOne({
      _id: new ObjectId(entryId),
    })

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Entry not found" },
        { status: 404 }
      )
    }

    // Check permission
    const comment = entry.comments?.find((c) => c.id === commentId)
    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      )
    }

    if (comment.userId !== userId && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    await hallOfFameCollection.updateOne(
      { _id: new ObjectId(entryId) },
      { $pull: { comments: { id: commentId } } }
    )

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete comment" },
      { status: 500 }
    )
  }
}
