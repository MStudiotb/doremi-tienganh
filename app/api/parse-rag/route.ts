import { NextRequest, NextResponse } from "next/server"
import { parseVocabOffline } from "@/lib/parse-rag-client"

export async function POST(req: NextRequest) {
  let body: { ragText?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const ragText = (body.ragText ?? "").slice(0, 6000)
  if (!ragText.trim()) {
    return NextResponse.json({ vocabulary: [] })
  }

  const vocabulary = parseVocabOffline(ragText)
  return NextResponse.json({ vocabulary })
}
