import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, 'public', 'favicon.svg');
const publicDir = join(__dirname, 'public');

async function generateIcons() {
  const svg = readFileSync(svgPath);
  
  await sharp(svg)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'pwa-192x192.png'));
    
  await sharp(svg)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'pwa-512x512.png'));
    
  console.log('PWA icons generated successfully!');
}

generateIcons().catch(console.error);
