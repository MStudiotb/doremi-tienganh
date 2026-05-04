const DB_NAME = "drm_cdb_v1"
const DB_VERSION = 1
const STORE_NAME = "ca"

// XOR-based lightweight obfuscation — not cryptographic, but prevents casual tampering
const MASK_SEED = 0x4e

function xorBytes(data: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ (MASK_SEED ^ (i % 19))
  }
  return out
}

function encodeBuffer(buffer: ArrayBuffer): string {
  const obfuscated = xorBytes(new Uint8Array(buffer))
  // Convert to base64 using proper Unicode handling
  let binary = ""
  const chunkSize = 0x8000 // Process in chunks to avoid call stack size exceeded
  for (let i = 0; i < obfuscated.length; i += chunkSize) {
    const chunk = obfuscated.subarray(i, Math.min(i + chunkSize, obfuscated.length))
    binary += String.fromCharCode(...chunk)
  }
  // Use btoa for binary data (this is safe for binary, not Unicode text)
  return btoa(binary)
}

function decodeString(encoded: string): ArrayBuffer {
  // Use atob for base64 decoding (safe for binary data)
  const binary = atob(encoded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return xorBytes(bytes).buffer as ArrayBuffer
}

// Key is base64-encoded and truncated so IDB keys are not human-readable
// Use TextEncoder for proper Unicode handling
function makeStoreKey(grade: string, fileName: string): string {
  const text = `${grade}::${fileName}`
  const encoder = new TextEncoder()
  const bytes = encoder.encode(text)
  // Convert bytes to base64
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/[+=]/g, "").slice(0, 36)
}

function openCurriculumDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "k" })
      }
    }
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveCurriculumAsset(
  grade: string,
  fileName: string,
  blob: Blob,
): Promise<void> {
  const db = await openCurriculumDb()
  const buffer = await blob.arrayBuffer()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const req = store.put({
      k: makeStoreKey(grade, fileName),
      d: encodeBuffer(buffer),
      t: blob.type,
      ts: Date.now(),
    })
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getCurriculumAsset(
  grade: string,
  fileName: string,
): Promise<Blob | null> {
  try {
    const db = await openCurriculumDb()
    const key = makeStoreKey(grade, fileName)

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => {
        const record = req.result as { k: string; d: string; t: string; ts: number } | undefined
        if (!record) {
          resolve(null)
          return
        }
        resolve(new Blob([decodeString(record.d)], { type: record.t }))
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function hasCurriculumAsset(
  grade: string,
  fileName: string,
): Promise<boolean> {
  const asset = await getCurriculumAsset(grade, fileName)
  return asset !== null
}
