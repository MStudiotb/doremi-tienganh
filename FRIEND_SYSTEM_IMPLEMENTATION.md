# 🤝 HỆ THỐNG KẾT BẠN - FRIEND SYSTEM

**Ngày triển khai:** 5/5/2026, 3:30 AM  
**Trạng thái:** ✅ API HOÀN THÀNH | ⏳ UI ĐANG CHỜ

---

## 📋 TÓM TẮT

Hệ thống kết bạn đơn giản cho phép người dùng:
- Gửi lời mời kết bạn
- Chấp nhận/từ chối lời mời
- Xem danh sách bạn bè
- Xóa bạn bè hoặc chặn người dùng

**Lưu ý:** Tính năng Chat real-time đã được tạm hoãn để tập trung vào Friend System trước.

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Database Schema
**File:** `lib/mongodb-collections.ts`

```typescript
export interface Friend {
  _id?: ObjectId
  userId: string // Email của người gửi
  friendId: string // Email của người nhận
  status: "pending" | "accepted" | "blocked" | "rejected"
  createdAt: Date
  updatedAt: Date
}
```

### 2. API Endpoints
**File:** `app/api/friends/route.ts`

#### GET /api/friends
Lấy danh sách bạn bè của user hiện tại
```bash
curl -H "Authorization: Bearer user@example.com" \
  http://localhost:3000/api/friends

# Lọc theo status
curl -H "Authorization: Bearer user@example.com" \
  "http://localhost:3000/api/friends?status=accepted"
```

**Response:**
```json
{
  "success": true,
  "friends": [
    {
      "id": "...",
      "userId": "user1@example.com",
      "friendId": "user2@example.com",
      "status": "accepted",
      "createdAt": "2026-05-05T03:00:00.000Z",
      "updatedAt": "2026-05-05T03:00:00.000Z",
      "friend": {
        "email": "user2@example.com",
        "name": "User 2",
        "image": "/avatars/user2.jpg"
      }
    }
  ]
}
```

#### POST /api/friends
Gửi lời mời kết bạn
```bash
curl -X POST \
  -H "Authorization: Bearer user1@example.com" \
  -H "Content-Type: application/json" \
  -d '{"friendEmail":"user2@example.com"}' \
  http://localhost:3000/api/friends
```

**Response:**
```json
{
  "success": true,
  "friendshipId": "...",
  "message": "Friend request sent successfully"
}
```

#### PATCH /api/friends
Chấp nhận/từ chối/chặn lời mời
```bash
curl -X PATCH \
  -H "Authorization: Bearer user2@example.com" \
  -H "Content-Type: application/json" \
  -d '{"friendshipId":"...","action":"accept"}' \
  http://localhost:3000/api/friends
```

**Actions:** `accept`, `reject`, `block`

**Response:**
```json
{
  "success": true,
  "message": "Friend request accepted successfully",
  "status": "accepted"
}
```

#### DELETE /api/friends
Xóa bạn bè hoặc hủy lời mời
```bash
curl -X DELETE \
  -H "Authorization: Bearer user1@example.com" \
  "http://localhost:3000/api/friends?id=..."
```

**Response:**
```json
{
  "success": true,
  "message": "Friendship deleted successfully"
}
```

---

## ⏳ CẦN HOÀN THÀNH

### 3. UI Components

#### A. FriendsPanel Component
**File cần tạo:** `components/FriendsPanel.tsx`

**Chức năng:**
- Hiển thị danh sách bạn bè đã chấp nhận
- Hiển thị lời mời kết bạn đang chờ
- Nút "Thêm bạn" để gửi lời mời mới
- Badge số lượng lời mời chưa đọc

**Giao diện đề xuất:**
```tsx
"use client"

import { useEffect, useState } from "react"
import { Users, UserPlus, Check, X } from "lucide-react"

interface FriendData {
  id: string
  status: string
  friend: {
    email: string
    name: string
    image: string | null
  }
}

export function FriendsPanel() {
  const [friends, setFriends] = useState<FriendData[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendData[]>([])
  
  // Load friends from API
  useEffect(() => {
    loadFriends()
  }, [])
  
  async function loadFriends() {
    const session = localStorage.getItem("doremi_session")
    if (!session) return
    
    const { email } = JSON.parse(session)
    
    const response = await fetch("/api/friends", {
      headers: {
        Authorization: `Bearer ${email}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      setFriends(data.friends.filter(f => f.status === "accepted"))
      setPendingRequests(data.friends.filter(f => f.status === "pending"))
    }
  }
  
  // Render UI...
}
```

#### B. Tích hợp vào Sidebar
**File cần sửa:** `components/Sidebar.tsx`

Thêm FriendsPanel vào cuối Sidebar, trước footer:
```tsx
import { FriendsPanel } from "./FriendsPanel"

// ... trong component Sidebar
<FriendsPanel />
```

#### C. AddFriendModal Component
**File cần tạo:** `components/AddFriendModal.tsx`

Modal để nhập email và gửi lời mời kết bạn:
```tsx
export function AddFriendModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const [email, setEmail] = useState("")
  
  async function handleSendRequest() {
    const session = localStorage.getItem("doremi_session")
    if (!session) return
    
    const { email: userEmail } = JSON.parse(session)
    
    const response = await fetch("/api/friends", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userEmail}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ friendEmail: email })
    })
    
    const data = await response.json()
    if (data.success) {
      alert("Đã gửi lời mời kết bạn!")
      onClose()
    } else {
      alert(data.error)
    }
  }
  
  // Render modal UI...
}
```

---

## 🎨 THIẾT KẾ GIAO DIỆN

### Màu sắc (theo DOREMI brand)
```css
/* Primary colors */
--friend-primary: oklch(0.52 0.22 285);
--friend-secondary: oklch(0.47 0.24 305);

/* Status colors */
--friend-online: oklch(0.68 0.2 165);
--friend-offline: oklch(0.45 0.1 280);
--friend-pending: oklch(0.72 0.28 60);
```

### Layout trong Sidebar
```
┌─────────────────────────┐
│ 🏠 Dashboard            │
│ 📚 Bài học              │
│ 📖 Tra cứu từ vựng      │
│ ...                     │
├─────────────────────────┤
│ 👥 BẠN BÈ (3)          │
│ ┌─────────────────────┐ │
│ │ 🔔 Lời mời (2)      │ │
│ │ • User A            │ │
│ │   [✓] [✗]           │ │
│ │ • User B            │ │
│ │   [✓] [✗]           │ │
│ └─────────────────────┘ │
│                         │
│ • User C (online)       │
│ • User D (offline)      │
│                         │
│ [+ Thêm bạn]            │
└─────────────────────────┘
```

---

## 🔒 BẢO MẬT

### Authentication
- Sử dụng Bearer token (email) trong Authorization header
- Mỗi request đều verify user qua `getUserEmailFromAuth()`
- Chỉ user liên quan mới có thể thao tác với friendship

### Validation
- ✅ Không thể tự kết bạn với chính mình
- ✅ Không thể gửi lời mời trùng lặp
- ✅ Chỉ người nhận mới có thể accept/reject
- ✅ Cả 2 bên đều có thể xóa friendship

---

## 🧪 TESTING

### Test Cases cần thực hiện:

#### 1. Gửi lời mời kết bạn
```bash
# User A gửi lời mời cho User B
curl -X POST \
  -H "Authorization: Bearer mstudiotb@gmail.com" \
  -H "Content-Type: application/json" \
  -d '{"friendEmail":"user@example.com"}' \
  http://localhost:3000/api/friends
```

#### 2. Xem lời mời đang chờ
```bash
# User B xem lời mời
curl -H "Authorization: Bearer user@example.com" \
  "http://localhost:3000/api/friends?status=pending"
```

#### 3. Chấp nhận lời mời
```bash
# User B chấp nhận
curl -X PATCH \
  -H "Authorization: Bearer user@example.com" \
  -H "Content-Type: application/json" \
  -d '{"friendshipId":"<ID>","action":"accept"}' \
  http://localhost:3000/api/friends
```

#### 4. Xem danh sách bạn bè
```bash
# Cả 2 user đều thấy nhau trong danh sách
curl -H "Authorization: Bearer mstudiotb@gmail.com" \
  "http://localhost:3000/api/friends?status=accepted"
```

#### 5. Xóa bạn bè
```bash
# User A xóa User B
curl -X DELETE \
  -H "Authorization: Bearer mstudiotb@gmail.com" \
  "http://localhost:3000/api/friends?id=<ID>"
```

---

## 📝 HƯỚNG DẪN TRIỂN KHAI UI

### Bước 1: Tạo FriendsPanel Component
```bash
# Tạo file mới
touch components/FriendsPanel.tsx
```

### Bước 2: Implement UI logic
- Load friends từ API khi component mount
- Hiển thị danh sách bạn bè với avatar
- Hiển thị lời mời chờ với nút Accept/Reject
- Thêm nút "Thêm bạn" mở modal

### Bước 3: Tích hợp vào Sidebar
```tsx
// components/Sidebar.tsx
import { FriendsPanel } from "./FriendsPanel"

// Thêm vào cuối sidebar, trước footer
<div className="mt-auto">
  <FriendsPanel />
</div>
```

### Bước 4: Test với 2 tài khoản
1. Đăng nhập Admin (mstudiotb@gmail.com)
2. Gửi lời mời cho User khác
3. Đăng nhập User khác
4. Chấp nhận lời mời
5. Verify cả 2 thấy nhau trong danh sách

---

## 🚀 TÍNH NĂNG TƯƠNG LAI (Chat System)

Khi sẵn sàng triển khai Chat, cần:

### 1. Messages API
**File:** `app/api/messages/route.ts`
- GET: Lấy tin nhắn giữa 2 users
- POST: Gửi tin nhắn mới
- PATCH: Đánh dấu đã đọc

### 2. Polling Mechanism
```typescript
// Poll messages every 3 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchNewMessages()
  }, 3000)
  
  return () => clearInterval(interval)
}, [])
```

### 3. ChatBox Component
- Floating chat window
- Message list với scroll
- Input box với emoji picker
- Image upload (max 10MB)
- Unread badge

### 4. Database
- Collection: `messages`
- Index: `senderId`, `receiverId`, `createdAt`
- TTL index: Auto-delete sau 30 ngày (optional)

---

## ✅ KẾT LUẬN

**Đã hoàn thành:**
- ✅ Database schema cho Friends
- ✅ API endpoints đầy đủ (GET, POST, PATCH, DELETE)
- ✅ Authentication và validation
- ✅ Document hướng dẫn chi tiết

**Cần làm tiếp:**
- ⏳ FriendsPanel UI component
- ⏳ AddFriendModal component
- ⏳ Tích hợp vào Sidebar
- ⏳ Test với 2 tài khoản thực

**Tính năng tương lai:**
- 💬 Chat System (Messages API + UI)
- 🔔 Real-time notifications
- 📱 Mobile responsive
- 🌐 Online/offline status

---

**Phát triển bởi:** TJN MSTUDIOTB  
**Công nghệ:** Next.js 15, MongoDB, TypeScript, Tailwind CSS
