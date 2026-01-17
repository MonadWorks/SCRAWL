import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const sizes = [16, 48, 128];

if (!existsSync('public/icons')) {
  mkdirSync('public/icons', { recursive: true });
}

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#3B82F6'; // blue-500
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Text "R" for Recorder
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R', size / 2, size / 2 + size * 0.05);

  const buffer = canvas.toBuffer('image/png');
  writeFileSync(`public/icons/icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
}

// Create disabled versions (gray)
for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#9CA3AF'; // gray-400
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Text "R" for Recorder
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R', size / 2, size / 2 + size * 0.05);

  const buffer = canvas.toBuffer('image/png');
  writeFileSync(`public/icons/icon${size}-disabled.png`, buffer);
  console.log(`Created icon${size}-disabled.png`);
}

console.log('Icons generated!');
