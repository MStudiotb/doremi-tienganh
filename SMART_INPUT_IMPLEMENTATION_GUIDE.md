# 🚀 Hướng Dẫn Nâng Cấp Tính Năng "Nhập Bài" Thông Minh

## 📋 Tổng Quan

Nâng cấp Modal "Nhập bài học" từ nhập thủ công đơn giản thành hệ thống thông minh với 4 phương thức:
1. ✍️ **Nhập thủ công** (Manual) - Đã có
2. 📄 **Upload file** (PDF & Word)
3. 💻 **Nhập JSON** (Structured data)
4. 📝 **Nhập văn bản tự nhiên** (Markdown/Text)

---

## 🛠️ Bước 1: Cài Đặt Thư Viện

```bash
npm install pdf-parse mammoth openai
npm install --save-dev @types/pdf-parse
```

**Giải thích:**
- `pdf-parse`: Parse nội dung từ file PDF
- `mammoth`: Parse nội dung từ file Word (.docx)
- `openai`: Sử dụng GPT để phân tích văn bản tự nhiên

---

## 🎨 Bước 2: Cập Nhật UI Component

### 2.1. Thêm State Cho Input Methods

```typescript
// components/lessons/DirectInputModal.tsx

const [inputMethod, setInputMethod] = useState<InputMethod>("manual")
const [uploadedFile, setUploadedFile] = useState<File | null>(null)
const [jsonInput, setJsonInput] = useState("")
const [textInput, setTextInput] = useState("")
const [parsedData, setParsedData] = useState<ParsedQuestion[]>([])
const [showPreview, setShowPreview] = useState(false)
const [isParsing, setIsParsing] = useState(false)
const fileInputRef = useRef<HTMLInputElement>(null)
```

### 2.2. Thêm Tab Navigation

```tsx
{/* Method Tabs */}
<div className="mb-6 flex gap-2 border-b border-white/10 pb-4">
  <button
    onClick={() => setInputMethod("manual")}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
      inputMethod === "manual"
        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
        : "text-white/50 hover:text-white hover:bg-white/5"
    }`}
  >
    <Plus className="size-4" /> Nhập thủ công
  </button>
  
  <button
    onClick={() => setInputMethod("file")}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
      inputMethod === "file"
        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
        : "text-white/50 hover:text-white hover:bg-white/5"
    }`}
  >
    <Upload className="size-4" /> Upload File
  </button>
  
  <button
    onClick={() => setInputMethod("json")}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
      inputMethod === "json"
        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
        : "text-white/50 hover:text-white hover:bg-white/5"
    }`}
  >
    <Code className="size-4" /> JSON
  </button>
  
  <button
    onClick={() => setInputMethod("text")}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
      inputMethod === "text"
        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
        : "text-white/50 hover:text-white hover:bg-white/5"
    }`}
  >
    <MessageSquare className="size-4" /> Văn bản
  </button>
</div>
```

---

## 📄 Bước 3: Implement File Upload

### 3.1. File Upload UI

```tsx
{inputMethod === "file" && (
  <div className="space-y-4">
    <div className="rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {uploadedFile ? (
        <div className="space-y-3">
          <FileText className="mx-auto size-12 text-cyan-400" />
          <p className="text-sm font-semibold text-white">{uploadedFile.name}</p>
          <p className="text-xs text-white/45">
            {(uploadedFile.size / 1024).toFixed(2)} KB
          </p>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Xóa file
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Upload className="mx-auto size-12 text-white/30" />
          <p className="text-sm font-semibold text-white">
            Kéo thả file hoặc click để chọn
          </p>
          <p className="text-xs text-white/45">
            Hỗ trợ: PDF, Word (.docx)
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/30"
          >
            Chọn file
          </button>
        </div>
      )}
    </div>
    
    {uploadedFile && (
      <button
        onClick={handleParseFile}
        disabled={isParsing}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-3 text-sm font-bold text-white hover:from-cyan-500/30 hover:to-blue-500/30 disabled:opacity-50"
      >
        {isParsing ? (
          <><Loader2 className="inline size-4 animate-spin mr-2" /> Đang phân tích...</>
        ) : (
          <>Phân tích file với AI</>
        )}
      </button>
    )}
  </div>
)}
```

### 3.2. File Parsing Logic

```typescript
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    setUploadedFile(file)
  }
}

const handleParseFile = async () => {
  if (!uploadedFile) return
  
  setIsParsing(true)
  try {
    const formData = new FormData()
    formData.append("file", uploadedFile)
    
    const response = await fetch("/api/parse-file", {
      method: "POST",
      body: formData,
    })
    
    const data = await response.json()
    
    if (data.success) {
      setParsedData(data.questions)
      setShowPreview(true)
    } else {
      alert("Lỗi phân tích file: " + data.error)
    }
  } catch (error) {
    console.error("Error parsing file:", error)
    alert("Không thể phân tích file!")
  } finally {
    setIsParsing(false)
  }
}
```

---

## 💻 Bước 4: Implement JSON Input

```tsx
{inputMethod === "json" && (
  <div className="space-y-4">
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="mb-2 text-xs font-semibold text-white/60">
        Cấu trúc JSON mẫu:
      </p>
      <pre className="overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-cyan-400">
{`[
  {
    "question": "Which sentence is correct?",
    "options": [
      "She don't like coffee.",
      "She doesn't like coffee.",
      "She not like coffee.",
      "She no like coffee."
    ],
    "answer": "She doesn't like coffee."
  }
]`}
      </pre>
    </div>
    
    <textarea
      value={jsonInput}
      onChange={(e) => setJsonInput(e.target.value)}
      placeholder="Dán JSON vào đây..."
      className="h-64 w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 font-mono text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50"
    />
    
    <button
      onClick={handleParseJSON}
      disabled={!jsonInput.trim() || isParsing}
      className="w-full rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-3 text-sm font-bold text-white hover:from-cyan-500/30 hover:to-blue-500/30 disabled:opacity-50"
    >
      {isParsing ? (
        <><Loader2 className="inline size-4 animate-spin mr-2" /> Đang xử lý...</>
      ) : (
        <>Phân tích JSON</>
      )}
    </button>
  </div>
)}
```

### JSON Parsing Logic

```typescript
const handleParseJSON = async () => {
  setIsParsing(true)
  try {
    const parsed = JSON.parse(jsonInput)
    
    if (!Array.isArray(parsed)) {
      throw new Error("JSON phải là một mảng")
    }
    
    // Validate structure
    const validated = parsed.map((item, index) => {
      if (!item.question || !item.options || !item.answer) {
        throw new Error(`Câu ${index + 1} thiếu trường bắt buộc`)
      }
      if (!Array.isArray(item.options) || item.options.length !== 4) {
        throw new Error(`Câu ${index + 1} phải có đúng 4 đáp án`)
      }
      return {
        question: item.question,
        options: item.options,
        answer: item.answer,
      }
    })
    
    setParsedData(validated)
    setShowPreview(true)
  } catch (error) {
    alert("Lỗi JSON: " + (error as Error).message)
  } finally {
    setIsParsing(false)
  }
}
```

---

## 📝 Bước 5: Implement Text/Markdown Parser

```tsx
{inputMethod === "text" && (
  <div className="space-y-4">
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="mb-2 text-xs font-semibold text-white/60">
        Định dạng văn bản mẫu:
      </p>
      <pre className="overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-white/70">
{`Q1: Which sentence is grammatically correct?
- She don't like coffee.
- She doesn't like coffee. (Correct)
- She not like coffee.
- She no like coffee.

Q2: Choose the correct form:
A) I am going to school.
B) I going to school.
C) I goes to school.
D) I am go to school.
Answer: A`}
      </pre>
    </div>
    
    <textarea
      value={textInput}
      onChange={(e) => setTextInput(e.target.value)}
      placeholder="Dán văn bản câu hỏi vào đây..."
      className="h-64 w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50"
    />
    
    <button
      onClick={handleParseText}
      disabled={!textInput.trim() || isParsing}
      className="w-full rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-3 text-sm font-bold text-white hover:from-cyan-500/30 hover:to-blue-500/30 disabled:opacity-50"
    >
      {isParsing ? (
        <><Loader2 className="inline size-4 animate-spin mr-2" /> AI đang phân tích...</>
      ) : (
        <>Phân tích với AI</>
      )}
    </button>
  </div>
)}
```

### Text Parsing với AI

```typescript
const handleParseText = async () => {
  setIsParsing(true)
  try {
    const response = await fetch("/api/parse-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textInput }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      setParsedData(data.questions)
      setShowPreview(true)
    } else {
      alert("Lỗi phân tích: " + data.error)
    }
  } catch (error) {
    console.error("Error parsing text:", error)
    alert("Không thể phân tích văn bản!")
  } finally {
    setIsParsing(false)
  }
}
```

---

## 👁️ Bước 6: Preview Table Component

```tsx
{showPreview && parsedData.length > 0 && (
  <div className="mt-6 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Eye className="size-5" /> Xem trước ({parsedData.length} câu hỏi)
      </h3>
      <button
        onClick={() => setShowPreview(false)}
        className="text-sm text-white/50 hover:text-white"
      >
        Ẩn
      </button>
    </div>
    
    <div className="max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-white/5">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white/10 backdrop-blur-sm">
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left font-semibold text-white/70">#</th>
            <th className="px-4 py-3 text-left font-semibold text-white/70">Câu hỏi</th>
            <th className="px-4 py-3 text-left font-semibold text-white/70">Đáp án</th>
            <th className="px-4 py-3 text-center font-semibold text-white/70">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {parsedData.map((q, index) => (
            <tr key={index} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-4 py-3 text-white/50">{index + 1}</td>
              <td className="px-4 py-3 text-white">
                <p className="mb-2 font-medium">{q.question}</p>
                <ul className="space-y-1 text-xs text-white/60">
                  {q.options.map((opt, i) => (
                    <li key={i} className={opt === q.answer ? "text-green-400 font-semibold" : ""}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
                  {q.answer}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => handleRemoveQuestion(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    <button
      onClick={handleSaveParsedData}
      disabled={isSaving}
      className="w-full rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-3 text-sm font-bold text-white hover:from-green-500/30 hover:to-emerald-500/30 disabled:opacity-50"
    >
      {isSaving ? (
        <><Loader2 className="inline size-4 animate-spin mr-2" /> Đang lưu...</>
      ) : (
        <><Save className="inline size-4 mr-2" /> Lưu {parsedData.length} câu hỏi vào hệ thống</>
      )}
    </button>
  </div>
)}
```

---

## 🔧 Bước 7: Backend API Endpoints

### 7.1. Parse File API (`app/api/parse-file/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server"
import pdf from "pdf-parse"
import mammoth from "mammoth"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" })
    }
    
    let text = ""
    
    // Parse PDF
    if (file.name.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const data = await pdf(buffer)
      text = data.text
    }
    // Parse Word
    else if (file.name.endsWith(".docx")) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }
    else {
      return NextResponse.json({ success: false, error: "Unsupported file type" })
    }
    
    // Use AI to parse questions
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting multiple choice questions from text. 
Extract all questions with exactly 4 options and identify the correct answer.
Return ONLY valid JSON array with this structure:
[{"question": "...", "options": ["A", "B", "C", "D"], "answer": "correct option"}]`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    })
    
    const parsed = JSON.parse(completion.choices[0].message.content || "[]")
    
    return NextResponse.json({ success: true, questions: parsed })
  } catch (error) {
    console.error("Parse file error:", error)
    return NextResponse.json({ success: false, error: String(error) })
  }
}
```

### 7.2. Parse Text API (`app/api/parse-text/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    
    if (!text) {
      return NextResponse.json({ success: false, error: "No text provided" })
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert at parsing multiple choice questions from natural language text.
Extract all questions, identify the 4 options, and determine the correct answer.
Support various formats: Q1/Q2, numbered lists, bullet points, (Correct) markers, Answer: X, etc.
Return ONLY valid JSON array:
[{"question": "...", "options": ["A", "B", "C", "D"], "answer": "correct option"}]`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    })
    
    const parsed = JSON.parse(completion.choices[0].message.content || "[]")
    
    return NextResponse.json({ success: true, questions: parsed })
  } catch (error) {
    console.error("Parse text error:", error)
    return NextResponse.json({ success: false, error: String(error) })
  }
}
```

---

## 🔐 Bước 8: Environment Variables

Thêm vào `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## ✅ Bước 9: Testing Checklist

- [ ] Test upload PDF file
- [ ] Test upload Word file
- [ ] Test JSON input với cấu trúc đúng
- [ ] Test JSON input với cấu trúc sai (error handling)
- [ ] Test text input với format Q1/Q2
- [ ] Test text input với format bullet points
- [ ] Test text input với (Correct) marker
- [ ] Test preview table hiển thị đúng
- [ ] Test xóa câu hỏi trong preview
- [ ] Test lưu dữ liệu vào IndexedDB
- [ ] Test với file lớn (>5MB)
- [ ] Test với nhiều câu hỏi (>50 câu)

---

## 🎯 Kết Quả Mong Đợi

1. **Admin có thể:**
   - Upload file PDF/Word → AI tự động trích xuất câu hỏi
   - Dán JSON chuẩn → Validate và hiển thị preview
   - Dán văn bản tự nhiên → AI phân tích thành câu hỏi
   - Xem trước tất cả câu hỏi trong bảng
   - Chỉnh sửa/xóa câu hỏi trước khi lưu
   - Lưu vào IndexedDB với 1 click

2. **Trải nghiệm người dùng:**
   - Giao diện tabs rõ ràng, dễ chuyển đổi
   - Loading states cho mọi thao tác
   - Error handling chi tiết
   - Preview trước khi commit
   - Responsive trên mobile

---

## 📚 Tài Liệu Tham Khảo

- [pdf-parse Documentation](https://www.npmjs.com/package/pdf-parse)
- [mammoth.js Documentation](https://www.npmjs.com/package/mammoth)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Next.js File Upload](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#formdata)

---

## 🚨 Lưu Ý Quan Trọng

1. **Chi phí OpenAI:** Mỗi lần parse sẽ tốn token GPT-4 (~$0.03-0.06/request)
2. **File size limit:** Giới hạn upload 10MB để tránh timeout
3. **Rate limiting:** Implement rate limit cho API để tránh abuse
4. **Security:** Validate file type và scan virus trước khi parse
5. **Caching:** Cache kết quả parse để tránh gọi API nhiều lần

---

**Tác giả:** TJN MSTUDIOTB  
**Ngày tạo:** 05/05/2026  
**Version:** 1.0.0
