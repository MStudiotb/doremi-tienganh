/**
 * Test Script for Weekly Test System
 * Demonstrates complete workflow from test creation to Hall of Fame
 */

const BASE_URL = "http://localhost:3000"

// Sample test data
const sampleTest = {
  title: "Bài Thi Tuần 1 - Kiểm Tra Từ Vựng Cơ Bản",
  description: "Kiểm tra kiến thức từ vựng và ngữ pháp tiếng Anh cơ bản cho học sinh",
  week: 1,
  year: 2026,
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      question: "What is the capital of Vietnam?",
      options: ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hue"],
      correctAnswer: "Hanoi",
      points: 10
    },
    {
      id: "q2",
      type: "multiple_choice",
      question: "Choose the correct form: 'She ___ to school every day.'",
      options: ["go", "goes", "going", "gone"],
      correctAnswer: "goes",
      points: 10
    },
    {
      id: "q3",
      type: "essay",
      question: "Write a short paragraph (3-5 sentences) about your daily routine.",
      points: 20
    },
    {
      id: "q4",
      type: "multiple_choice",
      question: "What does 'beautiful' mean?",
      options: ["đẹp", "xấu", "to", "nhỏ"],
      correctAnswer: "đẹp",
      points: 10
    },
    {
      id: "q5",
      type: "fill_blank",
      question: "I ___ (be) a student.",
      correctAnswer: "am",
      points: 10
    }
  ],
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  createdBy: "admin@doremi.com",
  role: "ADMIN"
}

// Sample user submissions
const userSubmissions = [
  {
    userId: "student1@doremi.com",
    userName: "Nguyễn Văn A",
    userAvatar: "/avatars/student1.jpg",
    answers: [
      { questionId: "q1", answer: "Hanoi" },
      { questionId: "q2", answer: "goes" },
      { questionId: "q3", answer: "I wake up at 6 AM every morning. Then I brush my teeth and have breakfast. After that, I go to school by bike. I study hard and play with my friends during break time." },
      { questionId: "q4", answer: "đẹp" },
      { questionId: "q5", answer: "am" }
    ]
  },
  {
    userId: "student2@doremi.com",
    userName: "Trần Thị B",
    userAvatar: "/avatars/student2.jpg",
    answers: [
      { questionId: "q1", answer: "Hanoi" },
      { questionId: "q2", answer: "go" }, // Wrong answer
      { questionId: "q3", answer: "I get up early. I eat breakfast. I go to school." },
      { questionId: "q4", answer: "đẹp" },
      { questionId: "q5", answer: "is" } // Wrong answer
    ]
  },
  {
    userId: "student3@doremi.com",
    userName: "Lê Văn C",
    userAvatar: "/avatars/student3.jpg",
    answers: [
      { questionId: "q1", answer: "Ho Chi Minh City" }, // Wrong answer
      { questionId: "q2", answer: "goes" },
      { questionId: "q3", answer: "My daily routine is simple. I wake up, eat, and go to school. After school, I do homework and play games." },
      { questionId: "q4", answer: "xấu" }, // Wrong answer
      { questionId: "q5", answer: "am" }
    ]
  }
]

async function createTest() {
  console.log("📝 Step 1: Creating test...")
  
  try {
    const response = await fetch(`${BASE_URL}/api/weekly-tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleTest)
    })

    const data = await response.json()
    
    if (data.success) {
      console.log("✅ Test created successfully!")
      console.log(`   Test ID: ${data.testId}`)
      return data.testId
    } else {
      console.error("❌ Failed to create test:", data.error)
      return null
    }
  } catch (error) {
    console.error("❌ Error creating test:", error.message)
    return null
  }
}

async function submitTest(testId, submission) {
  console.log(`\n📤 Submitting test for ${submission.userName}...`)
  
  try {
    const response = await fetch(`${BASE_URL}/api/weekly-tests/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testId,
        ...submission
      })
    })

    const data = await response.json()
    
    if (data.success) {
      console.log(`✅ Test submitted and graded!`)
      console.log(`   Score: ${data.score}/10`)
      console.log(`   Feedback: ${data.feedback}`)
      console.log(`   Top Score: ${data.isTopScore ? "YES 🏆" : "No"}`)
      return data
    } else {
      console.error(`❌ Failed to submit test:`, data.error)
      return null
    }
  } catch (error) {
    console.error(`❌ Error submitting test:`, error.message)
    return null
  }
}

async function checkHallOfFame() {
  console.log("\n🏆 Step 3: Checking Hall of Fame...")
  
  try {
    const response = await fetch(`${BASE_URL}/api/hall-of-fame?limit=1`)
    const data = await response.json()
    
    if (data.success && data.entries.length > 0) {
      const entry = data.entries[0]
      console.log("✅ Hall of Fame Entry Found!")
      console.log(`   Student: ${entry.userName}`)
      console.log(`   Score: ${entry.score}/10`)
      console.log(`   Test: ${entry.testTitle}`)
      console.log(`   Week: ${entry.week} - ${entry.year}`)
      console.log(`   AI Comment: ${entry.aiTeacherComment}`)
      console.log(`   Likes: ${entry.likes?.length || 0}`)
      console.log(`   Comments: ${entry.comments?.length || 0}`)
      return entry
    } else {
      console.log("ℹ️  No Hall of Fame entry yet (score might be < 8)")
      return null
    }
  } catch (error) {
    console.error("❌ Error checking Hall of Fame:", error.message)
    return null
  }
}

async function addInteraction(entryId, userId, userName, action, content = null) {
  console.log(`\n💬 Adding ${action} from ${userName}...`)
  
  try {
    const response = await fetch(`${BASE_URL}/api/hall-of-fame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        entryId,
        userId,
        userName,
        content
      })
    })

    const data = await response.json()
    
    if (data.success) {
      console.log(`✅ ${action === "like" ? "Liked" : "Comment added"} successfully!`)
      return data
    } else {
      console.error(`❌ Failed to add ${action}:`, data.error)
      return null
    }
  } catch (error) {
    console.error(`❌ Error adding ${action}:`, error.message)
    return null
  }
}

async function runCompleteTest() {
  console.log("🚀 Starting Weekly Test System Demo\n")
  console.log("=" .repeat(60))
  
  // Step 1: Create test
  const testId = await createTest()
  if (!testId) {
    console.error("\n❌ Cannot continue without test ID")
    return
  }

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Step 2: Submit tests from multiple users
  console.log("\n" + "=".repeat(60))
  console.log("📚 Step 2: Students taking the test...")
  
  const results = []
  for (const submission of userSubmissions) {
    const result = await submitTest(testId, submission)
    if (result) {
      results.push({ ...submission, ...result })
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Step 3: Check Hall of Fame
  console.log("\n" + "=".repeat(60))
  const hallOfFameEntry = await checkHallOfFame()

  if (hallOfFameEntry) {
    // Step 4: Add interactions
    console.log("\n" + "=".repeat(60))
    console.log("💬 Step 4: Adding social interactions...")
    
    await addInteraction(
      hallOfFameEntry._id,
      "student2@doremi.com",
      "Trần Thị B",
      "like"
    )
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await addInteraction(
      hallOfFameEntry._id,
      "student3@doremi.com",
      "Lê Văn C",
      "like"
    )
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await addInteraction(
      hallOfFameEntry._id,
      "student2@doremi.com",
      "Trần Thị B",
      "comment",
      "Chúc mừng bạn! Bạn học giỏi quá! 🎉"
    )
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await addInteraction(
      hallOfFameEntry._id,
      "student3@doremi.com",
      "Lê Văn C",
      "comment",
      "Tuyệt vời! Mình cũng phải cố gắng hơn nữa! 💪"
    )
  }

  // Final summary
  console.log("\n" + "=".repeat(60))
  console.log("🎉 DEMO COMPLETED!")
  console.log("=" .repeat(60))
  console.log("\n📊 Summary:")
  console.log(`   Tests submitted: ${results.length}`)
  console.log(`   Highest score: ${Math.max(...results.map(r => r.score))}/10`)
  console.log(`   Hall of Fame: ${hallOfFameEntry ? "Updated ✅" : "Not updated (score < 8)"}`)
  
  console.log("\n🌐 Next Steps:")
  console.log("   1. Open http://localhost:3000 in your browser")
  console.log("   2. Login with any student account")
  console.log("   3. Check the Dashboard to see the Hall of Fame card")
  console.log("   4. Go to 'Bài Thi Tuần' to see the test list")
  console.log("   5. Try liking and commenting on the Hall of Fame entry")
  
  console.log("\n" + "=".repeat(60))
}

// Run the demo
runCompleteTest().catch(error => {
  console.error("\n❌ Demo failed:", error)
  process.exit(1)
})
