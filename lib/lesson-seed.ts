export type VocabItem = {
  word: string
  phonetic: string
  meaning: string
}

export type LessonUnit = {
  id: string
  unitNumber: number
  title: string
  topic: string
  namespace: "primary_data" | "secondary_data" | "highschool_data"
  vocabulary: VocabItem[]
  sentences: string[]
  skillTags: string[]
  source: "seed" | "idb"
}

// Smart Start 1 — 10 units (Khối 1, Cấp 1)
// Vocabulary and sentence patterns based on standard Vietnamese primary English curriculum
export const smartStart1Units: LessonUnit[] = [
  {
    id: "ss1-u01",
    unitNumber: 1,
    title: "Unit 1: Hello!",
    topic: "Greetings & Introductions",
    namespace: "primary_data",
    vocabulary: [
      { word: "hello", phonetic: "/həˈloʊ/", meaning: "xin chào" },
      { word: "hi", phonetic: "/haɪ/", meaning: "chào" },
      { word: "goodbye", phonetic: "/ˌɡʊdˈbaɪ/", meaning: "tạm biệt" },
      { word: "name", phonetic: "/neɪm/", meaning: "tên" },
      { word: "meet", phonetic: "/miːt/", meaning: "gặp gỡ" },
      { word: "nice", phonetic: "/naɪs/", meaning: "vui / tốt" },
    ],
    sentences: [
      "Hello! My name is ___.",
      "Hi! What is your name?",
      "Nice to meet you!",
      "Goodbye! See you later.",
    ],
    skillTags: ["Từ vựng", "Nói"],
    source: "seed",
  },
  {
    id: "ss1-u02",
    unitNumber: 2,
    title: "Unit 2: My Family",
    topic: "Family Members",
    namespace: "primary_data",
    vocabulary: [
      { word: "mother", phonetic: "/ˈmʌðər/", meaning: "mẹ" },
      { word: "father", phonetic: "/ˈfɑːðər/", meaning: "bố" },
      { word: "sister", phonetic: "/ˈsɪstər/", meaning: "chị / em gái" },
      { word: "brother", phonetic: "/ˈbrʌðər/", meaning: "anh / em trai" },
      { word: "grandmother", phonetic: "/ˈɡrænˌmʌðər/", meaning: "bà" },
      { word: "grandfather", phonetic: "/ˈɡrænˌfɑːðər/", meaning: "ông" },
    ],
    sentences: [
      "This is my mother.",
      "He is my father.",
      "I have one sister and one brother.",
      "I love my family.",
    ],
    skillTags: ["Từ vựng", "Ngữ pháp"],
    source: "seed",
  },
  {
    id: "ss1-u03",
    unitNumber: 3,
    title: "Unit 3: My Body",
    topic: "Body Parts",
    namespace: "primary_data",
    vocabulary: [
      { word: "head", phonetic: "/hɛd/", meaning: "đầu" },
      { word: "eyes", phonetic: "/aɪz/", meaning: "mắt" },
      { word: "nose", phonetic: "/noʊz/", meaning: "mũi" },
      { word: "mouth", phonetic: "/maʊθ/", meaning: "miệng" },
      { word: "ears", phonetic: "/ɪərz/", meaning: "tai" },
      { word: "hands", phonetic: "/hændz/", meaning: "tay" },
    ],
    sentences: [
      "I have two eyes and one nose.",
      "Touch your head.",
      "My hands are small.",
      "Point to your ears.",
    ],
    skillTags: ["Từ vựng", "Nói"],
    source: "seed",
  },
  {
    id: "ss1-u04",
    unitNumber: 4,
    title: "Unit 4: My Toys",
    topic: "Toys & Colors",
    namespace: "primary_data",
    vocabulary: [
      { word: "ball", phonetic: "/bɔːl/", meaning: "quả bóng" },
      { word: "doll", phonetic: "/dɒl/", meaning: "búp bê" },
      { word: "car", phonetic: "/kɑːr/", meaning: "xe hơi" },
      { word: "red", phonetic: "/rɛd/", meaning: "màu đỏ" },
      { word: "blue", phonetic: "/bluː/", meaning: "màu xanh dương" },
      { word: "yellow", phonetic: "/ˈjɛloʊ/", meaning: "màu vàng" },
    ],
    sentences: [
      "I have a red ball.",
      "My doll is yellow.",
      "This is a blue car.",
      "What color is your toy?",
    ],
    skillTags: ["Từ vựng", "Ngữ pháp"],
    source: "seed",
  },
  {
    id: "ss1-u05",
    unitNumber: 5,
    title: "Unit 5: At School",
    topic: "Classroom Objects",
    namespace: "primary_data",
    vocabulary: [
      { word: "book", phonetic: "/bʊk/", meaning: "quyển sách" },
      { word: "pen", phonetic: "/pɛn/", meaning: "bút mực" },
      { word: "pencil", phonetic: "/ˈpɛnsəl/", meaning: "bút chì" },
      { word: "bag", phonetic: "/bæɡ/", meaning: "cặp sách" },
      { word: "ruler", phonetic: "/ˈruːlər/", meaning: "thước kẻ" },
      { word: "eraser", phonetic: "/ɪˈreɪzər/", meaning: "tẩy" },
    ],
    sentences: [
      "Open your book, please.",
      "This is my pencil.",
      "Put the pen in the bag.",
      "I need an eraser.",
    ],
    skillTags: ["Từ vựng", "Nghe"],
    source: "seed",
  },
  {
    id: "ss1-u06",
    unitNumber: 6,
    title: "Unit 6: Animals",
    topic: "Farm & Pet Animals",
    namespace: "primary_data",
    vocabulary: [
      { word: "cat", phonetic: "/kæt/", meaning: "con mèo" },
      { word: "dog", phonetic: "/dɒɡ/", meaning: "con chó" },
      { word: "bird", phonetic: "/bɜːrd/", meaning: "con chim" },
      { word: "fish", phonetic: "/fɪʃ/", meaning: "con cá" },
      { word: "cow", phonetic: "/kaʊ/", meaning: "con bò" },
      { word: "duck", phonetic: "/dʌk/", meaning: "con vịt" },
    ],
    sentences: [
      "I have a pet cat.",
      "The dog is big.",
      "Can you see the bird?",
      "The fish is in the water.",
    ],
    skillTags: ["Từ vựng", "Nói"],
    source: "seed",
  },
  {
    id: "ss1-u07",
    unitNumber: 7,
    title: "Unit 7: Food",
    topic: "Fruits & Food",
    namespace: "primary_data",
    vocabulary: [
      { word: "apple", phonetic: "/ˈæpəl/", meaning: "quả táo" },
      { word: "banana", phonetic: "/bəˈnænə/", meaning: "quả chuối" },
      { word: "orange", phonetic: "/ˈɒrɪndʒ/", meaning: "quả cam" },
      { word: "milk", phonetic: "/mɪlk/", meaning: "sữa" },
      { word: "bread", phonetic: "/brɛd/", meaning: "bánh mì" },
      { word: "rice", phonetic: "/raɪs/", meaning: "cơm / gạo" },
    ],
    sentences: [
      "I like apples.",
      "Do you want a banana?",
      "I drink milk every morning.",
      "This bread is delicious.",
    ],
    skillTags: ["Từ vựng", "Nói"],
    source: "seed",
  },
  {
    id: "ss1-u08",
    unitNumber: 8,
    title: "Unit 8: Numbers",
    topic: "Numbers 1 – 20",
    namespace: "primary_data",
    vocabulary: [
      { word: "one", phonetic: "/wʌn/", meaning: "một" },
      { word: "two", phonetic: "/tuː/", meaning: "hai" },
      { word: "five", phonetic: "/faɪv/", meaning: "năm" },
      { word: "ten", phonetic: "/tɛn/", meaning: "mười" },
      { word: "fifteen", phonetic: "/ˌfɪfˈtiːn/", meaning: "mười lăm" },
      { word: "twenty", phonetic: "/ˈtwɛnti/", meaning: "hai mươi" },
    ],
    sentences: [
      "I am ___ years old.",
      "How many apples? — Five!",
      "Count from one to ten.",
      "There are twenty students.",
    ],
    skillTags: ["Từ vựng", "Nghe"],
    source: "seed",
  },
  {
    id: "ss1-u09",
    unitNumber: 9,
    title: "Unit 9: Colors & Shapes",
    topic: "Colors and Shapes",
    namespace: "primary_data",
    vocabulary: [
      { word: "circle", phonetic: "/ˈsɜːrkəl/", meaning: "hình tròn" },
      { word: "square", phonetic: "/skwɛər/", meaning: "hình vuông" },
      { word: "triangle", phonetic: "/ˈtraɪæŋɡəl/", meaning: "hình tam giác" },
      { word: "green", phonetic: "/ɡriːn/", meaning: "màu xanh lá" },
      { word: "pink", phonetic: "/pɪŋk/", meaning: "màu hồng" },
      { word: "purple", phonetic: "/ˈpɜːrpəl/", meaning: "màu tím" },
    ],
    sentences: [
      "Draw a circle, please.",
      "The square is red.",
      "What shape is this?",
      "I see a purple triangle.",
    ],
    skillTags: ["Từ vựng", "Viết"],
    source: "seed",
  },
  {
    id: "ss1-u10",
    unitNumber: 10,
    title: "Unit 10: My Clothes",
    topic: "Clothing & Weather",
    namespace: "primary_data",
    vocabulary: [
      { word: "shirt", phonetic: "/ʃɜːrt/", meaning: "áo sơ mi" },
      { word: "pants", phonetic: "/pænts/", meaning: "quần dài" },
      { word: "shoes", phonetic: "/ʃuːz/", meaning: "giày" },
      { word: "hat", phonetic: "/hæt/", meaning: "mũ" },
      { word: "dress", phonetic: "/drɛs/", meaning: "váy đầm" },
      { word: "jacket", phonetic: "/ˈdʒækɪt/", meaning: "áo khoác" },
    ],
    sentences: [
      "I am wearing a red shirt.",
      "Put on your shoes.",
      "It is cold. Wear a jacket!",
      "She has a pretty dress.",
    ],
    skillTags: ["Từ vựng", "Ngữ pháp"],
    source: "seed",
  },
]

// Parse ragText from a single IDB resource into multiple unit-like lessons
export function parseRagIntoUnits(
  ragText: string,
  namespace: "primary_data" | "secondary_data" | "highschool_data",
  sourceId: string,
): LessonUnit[] {
  if (!ragText || ragText.trim().length < 100) return []

  // Try to split by "Unit N" markers
  const unitPattern = /Unit\s+(\d+)[:\s]/gi
  const unitMatches = [...ragText.matchAll(unitPattern)]

  if (unitMatches.length >= 2) {
    return unitMatches.map((match, i) => {
      const start = match.index ?? 0
      const end = unitMatches[i + 1]?.index ?? ragText.length
      const chunk = ragText.slice(start, end).trim()
      const unitNum = parseInt(match[1], 10)

      // Extract first non-unit line as topic
      const lines = chunk.split("\n").filter((l) => l.trim().length > 0)
      const topic = lines[1]?.trim() || `Unit ${unitNum}`

      // Extract vocabulary: words in CAPS or quoted, or lines containing "/"
      const vocabLines = chunk
        .split("\n")
        .filter((l) => l.includes("/") || /^[A-Z][a-z]+$/.test(l.trim()))
        .slice(0, 6)
      const vocabulary: VocabItem[] = vocabLines.map((line) => {
        const parts = line.trim().split(/\s{2,}|\t/)
        return {
          word: parts[0]?.toLowerCase() ?? line.trim(),
          phonetic: parts[1] ?? "",
          meaning: parts[2] ?? "",
        }
      })

      // Extract sentences: lines ending with punctuation
      const sentences = chunk
        .split("\n")
        .filter((l) => /[.!?]$/.test(l.trim()) && l.trim().length > 8)
        .slice(0, 4)
        .map((l) => l.trim())

      return {
        id: `${sourceId}-u${String(unitNum).padStart(2, "0")}`,
        unitNumber: unitNum,
        title: `Unit ${unitNum}: ${topic}`,
        topic,
        namespace,
        vocabulary: vocabulary.length ? vocabulary : [],
        sentences: sentences.length ? sentences : [],
        skillTags: ["Từ vựng"],
        source: "idb" as const,
      }
    })
  }

  return []
}
