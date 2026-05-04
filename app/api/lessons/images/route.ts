import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const theme = searchParams.get("theme") || "gia-dinh"
    const questionId = searchParams.get("questionId")
    
    console.log(`[Images API] Request - Theme: ${theme}, QuestionId: ${questionId}`)
    
    // Đường dẫn đến thư mục chứa ảnh
    const imagesDir = path.join(process.cwd(), "public", "lessons", theme)
    console.log(`[Images API] Checking directory: ${imagesDir}`)
    
    // Kiểm tra xem thư mục có tồn tại không
    if (!fs.existsSync(imagesDir)) {
      console.warn(`[Images API] Directory not found: ${imagesDir}`)
      
      // Tự động tạo thư mục nếu chưa tồn tại
      try {
        fs.mkdirSync(imagesDir, { recursive: true })
        console.log(`[Images API] Created directory: ${imagesDir}`)
      } catch (mkdirError) {
        console.error(`[Images API] Failed to create directory:`, mkdirError)
      }
      
      return NextResponse.json({ 
        images: [], 
        localImage: null,
        debug: {
          theme,
          questionId,
          directoryExists: false,
          directoryPath: imagesDir
        }
      })
    }
    
    // Đọc tất cả file trong thư mục
    const files = fs.readdirSync(imagesDir)
    console.log(`[Images API] Files found in directory:`, files)
    
    // Lọc chỉ lấy file ảnh
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return imageExtensions.includes(ext) && !file.startsWith(".")
    })
    
    console.log(`[Images API] Image files filtered:`, imageFiles)
    
    // Nếu có questionId, kiểm tra xem có file ảnh tương ứng không
    let localImage = null
    if (questionId) {
      const matchingFile = imageFiles.find((file) => {
        const fileNameWithoutExt = path.parse(file).name
        return fileNameWithoutExt === questionId
      })
      
      if (matchingFile) {
        // URL encode the filename to handle special characters
        const encodedFileName = encodeURIComponent(matchingFile)
        localImage = `/lessons/${theme}/${encodedFileName}`
        console.log(`[Images API] Found matching image for questionId ${questionId}: ${localImage}`)
      } else {
        console.log(`[Images API] No matching image found for questionId ${questionId}`)
      }
    }
    
    // Trả về danh sách đường dẫn ảnh và ảnh local nếu có (với URL encoding)
    const imagePaths = imageFiles.map((file) => {
      const encodedFileName = encodeURIComponent(file)
      return `/lessons/${theme}/${encodedFileName}`
    })
    
    console.log(`[Images API] Response - Images: ${imagePaths.length}, LocalImage: ${localImage || 'none'}`)
    
    return NextResponse.json({ 
      images: imagePaths,
      localImage,
      debug: {
        theme,
        questionId,
        directoryExists: true,
        totalFiles: files.length,
        imageFiles: imageFiles.length,
        imageFileNames: imageFiles
      }
    })
  } catch (error) {
    console.error("[Images API] Error reading images:", error)
    return NextResponse.json({ 
      images: [], 
      localImage: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
