import { NextResponse } from "next/server"
import { getMongoClient } from "@/lib/mongodb"
import type { Friend, FriendStatus } from "@/lib/mongodb-collections"

export const dynamic = "force-dynamic"

/**
 * Helper function to get user email from Authorization header
 */
async function getUserEmailFromAuth(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  
  // Decode token to get email (simple implementation)
  // In production, you should verify JWT token properly
  try {
    const clientPromise = getMongoClient()
    if (!clientPromise) return null
    
    const client = await clientPromise
    const db = client.db("doremi")
    const usersCollection = db.collection("users")
    
    // Find user by token or email in token
    const user = await usersCollection.findOne({ email: token })
    return user?.email || null
  } catch {
    return null
  }
}

/**
 * GET /api/friends
 * Lấy danh sách bạn bè của user hiện tại
 */
export async function GET(request: Request) {
  try {
    const userEmail = await getUserEmailFromAuth(request)
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as FriendStatus | null

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const friendsCollection = db.collection<Friend>("friends")
    const usersCollection = db.collection("users")

    // Build query
    const query: any = {
      $or: [{ userId: userEmail }, { friendId: userEmail }],
    }
    if (status) {
      query.status = status
    }

    // Get friends
    const friendships = await friendsCollection.find(query).toArray()

    // Get user details for each friend
    const friendsWithDetails = await Promise.all(
      friendships.map(async (friendship) => {
        const friendEmail =
          friendship.userId === userEmail
            ? friendship.friendId
            : friendship.userId

        const friendUser = await usersCollection.findOne({ email: friendEmail })

        return {
          id: friendship._id?.toString(),
          userId: friendship.userId,
          friendId: friendship.friendId,
          status: friendship.status,
          createdAt: friendship.createdAt,
          updatedAt: friendship.updatedAt,
          friend: friendUser
            ? {
                email: friendUser.email,
                name: friendUser.name || "Unknown",
                image: friendUser.image || null,
              }
            : null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      friends: friendsWithDetails,
    })
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch friends",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/friends
 * Gửi lời mời kết bạn
 */
export async function POST(request: Request) {
  try {
    const userEmail = await getUserEmailFromAuth(request)
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { friendEmail } = body

    if (!friendEmail) {
      return NextResponse.json(
        { success: false, error: "Friend email is required" },
        { status: 400 }
      )
    }

    if (friendEmail === userEmail) {
      return NextResponse.json(
        { success: false, error: "Cannot add yourself as friend" },
        { status: 400 }
      )
    }

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const friendsCollection = db.collection<Friend>("friends")
    const usersCollection = db.collection("users")

    // Check if friend exists
    const friendUser = await usersCollection.findOne({ email: friendEmail })
    if (!friendUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Check if friendship already exists
    const existingFriendship = await friendsCollection.findOne({
      $or: [
        { userId: userEmail, friendId: friendEmail },
        { userId: friendEmail, friendId: userEmail },
      ],
    })

    if (existingFriendship) {
      return NextResponse.json(
        {
          success: false,
          error: "Friend request already exists",
          status: existingFriendship.status,
        },
        { status: 400 }
      )
    }

    // Create friend request
    const newFriendship: Friend = {
      userId: userEmail,
      friendId: friendEmail,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await friendsCollection.insertOne(newFriendship)

    return NextResponse.json({
      success: true,
      friendshipId: result.insertedId.toString(),
      message: "Friend request sent successfully",
    })
  } catch (error) {
    console.error("Error sending friend request:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send friend request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/friends
 * Cập nhật trạng thái kết bạn (accept/reject/block)
 */
export async function PATCH(request: Request) {
  try {
    const userEmail = await getUserEmailFromAuth(request)
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { friendshipId, action } = body

    if (!friendshipId || !action) {
      return NextResponse.json(
        { success: false, error: "Friendship ID and action are required" },
        { status: 400 }
      )
    }

    if (!["accept", "reject", "block"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      )
    }

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const friendsCollection = db.collection<Friend>("friends")

    // Get friendship
    const { ObjectId } = require("mongodb")
    const friendship = await friendsCollection.findOne({
      _id: new ObjectId(friendshipId),
    })

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: "Friendship not found" },
        { status: 404 }
      )
    }

    // Verify user is the receiver
    if (friendship.friendId !== userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to update this friendship" },
        { status: 403 }
      )
    }

    // Update status
    const newStatus: FriendStatus =
      action === "accept" ? "accepted" : action === "reject" ? "rejected" : "blocked"

    await friendsCollection.updateOne(
      { _id: new ObjectId(friendshipId) },
      {
        $set: {
          status: newStatus,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      message: `Friend request ${action}ed successfully`,
      status: newStatus,
    })
  } catch (error) {
    console.error("Error updating friendship:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update friendship",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/friends
 * Xóa bạn bè hoặc hủy lời mời
 */
export async function DELETE(request: Request) {
  try {
    const userEmail = await getUserEmailFromAuth(request)
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const friendshipId = searchParams.get("id")

    if (!friendshipId) {
      return NextResponse.json(
        { success: false, error: "Friendship ID is required" },
        { status: 400 }
      )
    }

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const friendsCollection = db.collection<Friend>("friends")

    const { ObjectId } = require("mongodb")
    const friendship = await friendsCollection.findOne({
      _id: new ObjectId(friendshipId),
    })

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: "Friendship not found" },
        { status: 404 }
      )
    }

    // Verify user is part of this friendship
    if (
      friendship.userId !== userEmail &&
      friendship.friendId !== userEmail
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this friendship" },
        { status: 403 }
      )
    }

    await friendsCollection.deleteOne({ _id: new ObjectId(friendshipId) })

    return NextResponse.json({
      success: true,
      message: "Friendship deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting friendship:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete friendship",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
