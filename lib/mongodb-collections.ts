/**
 * MongoDB Collections Schema Definitions
 * Định nghĩa cấu trúc dữ liệu cho các collection
 */

import { ObjectId } from "mongodb"

// ============================================================================
// FRIENDS COLLECTION
// ============================================================================

export type FriendStatus = "pending" | "accepted" | "blocked" | "rejected"

export interface Friend {
  _id?: ObjectId
  userId: string // User ID của người gửi lời mời
  friendId: string // User ID của người nhận lời mời
  status: FriendStatus
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// MESSAGES COLLECTION
// ============================================================================

export type MessageType = "text" | "image"

export interface Message {
  _id?: ObjectId
  senderId: string // User ID của người gửi
  receiverId: string // User ID của người nhận
  content: string // Nội dung tin nhắn hoặc URL ảnh
  type: MessageType
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// CONVERSATIONS COLLECTION (Optional - for optimization)
// ============================================================================

export interface Conversation {
  _id?: ObjectId
  participants: string[] // Array of 2 user IDs
  lastMessage?: string
  lastMessageAt?: Date
  unreadCount: Record<string, number> // { userId: count }
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Tạo conversation ID từ 2 user IDs (luôn sắp xếp để đảm bảo unique)
 */
export function getConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join("_")
}

/**
 * Kiểm tra xem 2 user có phải bạn bè không
 */
export function areFriends(
  userId: string,
  friendId: string,
  friends: Friend[]
): boolean {
  return friends.some(
    (f) =>
      f.status === "accepted" &&
      ((f.userId === userId && f.friendId === friendId) ||
        (f.userId === friendId && f.friendId === userId))
  )
}

// ============================================================================
// WEEKLY TESTS COLLECTION
// ============================================================================

export type TestStatus = "draft" | "active" | "closed"
export type QuestionType = "multiple_choice" | "essay" | "fill_blank"

export interface TestQuestion {
  id: string
  type: QuestionType
  question: string
  options?: string[] // For multiple choice
  correctAnswer?: string // For auto-grading
  points: number
}

export interface WeeklyTest {
  _id?: ObjectId
  title: string
  description: string
  week: number // Week number (e.g., 1, 2, 3...)
  year: number
  questions: TestQuestion[]
  pdfUrl?: string // Optional PDF file URL
  status: TestStatus
  startDate: Date
  endDate: Date
  totalPoints: number
  createdBy: string // Admin user ID
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// TEST SUBMISSIONS COLLECTION
// ============================================================================

export type SubmissionStatus = "submitted" | "graded" | "pending_review"

export interface SubmissionAnswer {
  questionId: string
  answer: string
  isCorrect?: boolean
  pointsEarned?: number
  feedback?: string
}

export interface TestSubmission {
  _id?: ObjectId
  testId: string // WeeklyTest ID
  userId: string
  userName: string
  userAvatar?: string
  answers: SubmissionAnswer[]
  totalScore: number // Out of 10
  rawScore?: number // Actual points earned
  status: SubmissionStatus
  aiTeacherFeedback?: string // AI feedback from "Cô Doremi"
  screenshot?: string // Screenshot of test submission (base64 data URL)
  submittedAt: Date
  gradedAt?: Date
  gradedBy?: string // "AI" or admin user ID
}

// ============================================================================
// HALL OF FAME COLLECTION
// ============================================================================

export interface HallOfFameEntry {
  _id?: ObjectId
  testId: string
  testTitle: string
  week: number
  year: number
  submissionId: string
  userId: string
  userName: string
  userAvatar?: string
  score: number
  imageUrl: string // URL to the celebration image
  aiTeacherComment: string
  likes: string[] // Array of user IDs who liked
  comments: HallOfFameComment[]
  featuredAt: Date
  createdAt: Date
}

export interface HallOfFameComment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: Date
}

// ============================================================================
// NOTIFICATIONS COLLECTION
// ============================================================================

export type NotificationType = "new_test" | "test_graded" | "hall_of_fame" | "comment" | "like"

export interface Notification {
  _id?: ObjectId
  userId: string
  type: NotificationType
  title: string
  message: string
  icon?: string // Icon path (e.g., "/chuong.png")
  link?: string // Link to relevant page
  isRead: boolean
  createdAt: Date
}
