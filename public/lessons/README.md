# Lessons Images Directory

This directory contains images for different lesson themes used in the writing exercises.

## Directory Structure

```
lessons/
├── gia-dinh/       # Family theme
├── truong-hoc/     # School theme
├── thien-nhien/    # Nature theme
├── the-thao/       # Sports theme
└── thuc-an/        # Food theme
```

## Image Naming Convention

Images should be named using the **questionId** (e.g., `1.png`, `2.png`, `3.png`) to match with specific exercises.

**Important:** 
- ✅ Use simple filenames without spaces: `1.png`, `2.png`
- ❌ Avoid spaces in filenames: `gia dinh 1.png` (causes URL encoding issues)
- ✅ Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`

## How It Works

The system uses a **hybrid approach** to load images:

1. **Priority 1: Local Images** - Checks for existing images in the theme folder
2. **Priority 2: AI Generation** - If no local image exists, generates one using OpenAI DALL-E
3. **Priority 3: Fallback** - Uses random available images or placeholder

## API Endpoints

- `GET /api/lessons/images?theme={theme}&questionId={id}` - Get images for a theme
- `POST /api/lessons/generate-image` - Generate AI image
- `POST /api/lessons/save-image` - Save AI-generated image locally

## Troubleshooting

### Images not displaying (black box)?

1. **Check file names** - Ensure no spaces in filenames
2. **Check directory** - Verify images exist in `/public/lessons/{theme}/`
3. **Check console logs** - Look for `[Images API]` logs in the browser console
4. **Check file permissions** - Ensure the system can read/write to the directory

### Recent Fixes (2026-05-02)

- ✅ Fixed filename with spaces: `gia dinh 1.png` → `1.png`
- ✅ Added URL encoding for image paths
- ✅ Added comprehensive logging to all API endpoints
- ✅ Added automatic directory creation if missing
- ✅ Added special prompt for "Gia đình" theme: "A happy Vietnamese family, 3D Pixar style"

## Console Logs

When debugging, check for these log patterns:

```
[Images API] Request - Theme: gia-dinh, QuestionId: 1
[Images API] Files found in directory: ['.gitkeep', '1.png']
[Images API] Image files filtered: ['1.png']
[Images API] Found matching image for questionId 1: /lessons/gia-dinh/1.png
```

## Adding New Images

To add images for a theme:

1. Navigate to `/public/lessons/{theme-slug}/`
2. Add images named by questionId: `1.png`, `2.png`, etc.
3. Refresh the application - images will be loaded automatically

Theme slugs:
- Gia đình → `gia-dinh`
- Trường học → `truong-hoc`
- Thiên nhiên → `thien-nhien`
- Thể thao → `the-thao`
- Thức ăn → `thuc-an`
