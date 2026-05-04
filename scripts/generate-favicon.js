const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    const logoPath = path.join(__dirname, '../public/logo.png');
    const faviconPath = path.join(__dirname, '../app/favicon.ico');
    const appleTouchIconPath = path.join(__dirname, '../app/apple-icon.png');
    const iconPath = path.join(__dirname, '../app/icon.png');

    console.log('🎨 Generating favicon and app icons from logo.png...');

    // Generate 32x32 favicon.ico (ICO format is actually PNG for modern browsers)
    await sharp(logoPath)
      .resize(32, 32, { fit: 'contain', background: { r: 13, g: 43, b: 51, alpha: 1 } })
      .png()
      .toFile(faviconPath);
    console.log('✅ Generated app/favicon.ico (32x32)');

    // Generate 180x180 Apple Touch Icon
    await sharp(logoPath)
      .resize(180, 180, { fit: 'contain', background: { r: 13, g: 43, b: 51, alpha: 1 } })
      .png()
      .toFile(appleTouchIconPath);
    console.log('✅ Generated app/apple-icon.png (180x180)');

    // Generate 192x192 icon for PWA
    await sharp(logoPath)
      .resize(192, 192, { fit: 'contain', background: { r: 13, g: 43, b: 51, alpha: 1 } })
      .png()
      .toFile(iconPath);
    console.log('✅ Generated app/icon.png (192x192)');

    console.log('🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateFavicon();
