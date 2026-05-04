// User progress management for unit unlocking
import { getMongoClient } from "./mongodb";

export type UserProgress = {
  email: string;
  completedUnits: string[]; // Array of completed unit IDs
  currentStreak: number;
  totalLessonsCompleted: number;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
};

const DB_NAME = "doremi_learning";
const COLLECTION_NAME = "user_progress";

/**
 * Get user progress from MongoDB or localStorage fallback
 */
export async function getUserProgress(email: string): Promise<UserProgress> {
  const clientPromise = getMongoClient();

  // MongoDB mode
  if (clientPromise) {
    try {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const collection = db.collection<UserProgress>(COLLECTION_NAME);

      let progress = await collection.findOne({ email });

      if (!progress) {
        // Create new progress record
        const newProgress: UserProgress = {
          email,
          completedUnits: [],
          currentStreak: 0,
          totalLessonsCompleted: 0,
          lastActivityDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await collection.insertOne(newProgress);
        return newProgress;
      }

      return {
        email: progress.email,
        completedUnits: progress.completedUnits,
        currentStreak: progress.currentStreak,
        totalLessonsCompleted: progress.totalLessonsCompleted,
        lastActivityDate: progress.lastActivityDate,
        createdAt: progress.createdAt,
        updatedAt: progress.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching user progress from MongoDB:", error);
    }
  }

  // Fallback to localStorage (client-side only)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`doremi_progress_${email}`);
    if (stored) {
      return JSON.parse(stored);
    }
  }

  // Default progress
  return {
    email,
    completedUnits: [],
    currentStreak: 0,
    totalLessonsCompleted: 0,
    lastActivityDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Mark a unit as completed
 */
export async function markUnitCompleted(
  email: string,
  unitId: string
): Promise<UserProgress> {
  const clientPromise = getMongoClient();

  // MongoDB mode
  if (clientPromise) {
    try {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const collection = db.collection<UserProgress>(COLLECTION_NAME);

      const result = await collection.findOneAndUpdate(
        { email },
        {
          $addToSet: { completedUnits: unitId },
          $inc: { totalLessonsCompleted: 1 },
          $set: {
            lastActivityDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true, returnDocument: "after" }
      );

      if (result) {
        return {
          email: result.email,
          completedUnits: result.completedUnits,
          currentStreak: result.currentStreak,
          totalLessonsCompleted: result.totalLessonsCompleted,
          lastActivityDate: result.lastActivityDate,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        };
      }
    } catch (error) {
      console.error("Error updating user progress in MongoDB:", error);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const progress = await getUserProgress(email);
    if (!progress.completedUnits.includes(unitId)) {
      progress.completedUnits.push(unitId);
      progress.totalLessonsCompleted++;
      progress.lastActivityDate = new Date().toISOString();
      progress.updatedAt = new Date().toISOString();
      localStorage.setItem(`doremi_progress_${email}`, JSON.stringify(progress));
    }
    return progress;
  }

  return getUserProgress(email);
}

/**
 * Check if a unit is unlocked based on completion of previous units
 */
export function isUnitUnlocked(
  unitId: string,
  unitIndex: number,
  completedUnits: string[],
  allUnitIds: string[]
): boolean {
  // First unit is always unlocked
  if (unitIndex === 0) {
    return true;
  }

  // Check if previous unit is completed
  const previousUnitId = allUnitIds[unitIndex - 1];
  return completedUnits.includes(previousUnitId);
}

/**
 * Get progress percentage for a unit (from localStorage)
 */
export function getUnitProgress(unitId: string): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(`doremi_lesson_progress_${unitId}`);
  return stored ? Math.min(100, Math.max(0, parseInt(stored, 10))) : 0;
}

/**
 * Save unit progress percentage (localStorage)
 */
export function saveUnitProgress(unitId: string, progress: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `doremi_lesson_progress_${unitId}`,
    Math.min(100, Math.max(0, progress)).toString()
  );
}
