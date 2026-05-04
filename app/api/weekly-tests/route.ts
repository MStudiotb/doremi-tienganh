/**
 * API Routes for Weekly Tests Management
 * Admin: Create, Update, Delete tests
 * User: Get active tests
 */

import { NextRequest, NextResponse } from "next/server"
import { getMongoClient } from "@/lib/mongodb"
import { WeeklyTest, TestStatus } from "@/lib/mongodb-collections"
import { ObjectId } from "mongodb"

// GET: Fetch all tests (admin) or active tests (user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const status = searchParams.get("status")

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const testsCollection = db.collection<WeeklyTest>("weeklyTests")

    let query: any = {}

    // If user role, only show active tests
    if (role === "USER") {
      query.status = "active"
      query.startDate = { $lte: new Date() }
      query.endDate = { $gte: new Date() }
    } else if (status) {
      query.status = status
    }

    const tests = await testsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, tests })
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch tests" },
      { status: 500 }
    )
  }
}

// POST: Create new test (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      week,
      year,
      questions,
      pdfUrl,
      startDate,
      endDate,
      createdBy,
      role,
    } = body

    // Check admin permission
    if (role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!title || !week || !year || !questions || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Calculate total points
    const totalPoints = questions.reduce(
      (sum: number, q: any) => sum + (q.points || 0),
      0
    )

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const testsCollection = db.collection<WeeklyTest>("weeklyTests")

    const newTest: WeeklyTest = {
      title,
      description: description || "",
      week: parseInt(week),
      year: parseInt(year),
      questions,
      pdfUrl,
      status: "active",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPoints,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await testsCollection.insertOne(newTest)

    // Create notifications for all users
    const usersCollection = db.collection("users")
    const users = await usersCollection.find({}).toArray()

    const notificationsCollection = db.collection("notifications")
    const notifications = users.map((user) => ({
      userId: user.email,
      type: "new_test",
      title: "🔔 Bài Thi Tuần Mới!",
      message: `Bài thi "${title}" đã được phát hành. Hãy vào làm bài ngay!`,
      icon: "/chuong.png",
      link: "/weekly-tests",
      isRead: false,
      createdAt: new Date(),
    }))

    if (notifications.length > 0) {
      await notificationsCollection.insertMany(notifications)
    }

    return NextResponse.json({
      success: true,
      testId: result.insertedId.toString(),
      message: "Test created successfully",
    })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create test" },
      { status: 500 }
    )
  }
}

// PUT: Update test (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { testId, role, ...updates } = body

    // Check admin permission
    if (role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    if (!testId) {
      return NextResponse.json(
        { success: false, error: "Test ID is required" },
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
    const testsCollection = db.collection<WeeklyTest>("weeklyTests")

    // Recalculate total points if questions are updated
    if (updates.questions) {
      updates.totalPoints = updates.questions.reduce(
        (sum: number, q: any) => sum + (q.points || 0),
        0
      )
    }

    updates.updatedAt = new Date()

    const result = await testsCollection.updateOne(
      { _id: new ObjectId(testId) },
      { $set: updates }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test updated successfully",
    })
  } catch (error) {
    console.error("Error updating test:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update test" },
      { status: 500 }
    )
  }
}

// DELETE: Delete test (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get("testId")
    const role = searchParams.get("role")

    // Check admin permission
    if (role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    if (!testId) {
      return NextResponse.json(
        { success: false, error: "Test ID is required" },
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
    const testsCollection = db.collection<WeeklyTest>("weeklyTests")
    const submissionsCollection = db.collection("testSubmissions")

    // Delete the test
    const result = await testsCollection.deleteOne({
      _id: new ObjectId(testId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      )
    }

    // Cascade delete: Remove all submissions related to this test
    const submissionsResult = await submissionsCollection.deleteMany({
      testId: testId,
    })

    console.log(`Deleted test ${testId} and ${submissionsResult.deletedCount} related submissions`)

    return NextResponse.json({
      success: true,
      message: "Test deleted successfully",
      deletedSubmissions: submissionsResult.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting test:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete test" },
      { status: 500 }
    )
  }
}
