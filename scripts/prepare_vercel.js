#!/usr/bin/env node

// Prepare Vercel Build - Merge frontend and backend into single Next.js app structure
// This script creates a unified app/ directory at the root for Vercel deployment

const fs = require('fs');
const path = require('path');

console.log('Preparing Vercel deployment structure...');

const rootDir = process.cwd();

// Helper function to copy directory recursively
function copyDirRecursive(src, dest, merge = false) {
  if (!fs.existsSync(src)) {
    console.log(`Source not found: ${src} -- skipping`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!merge && fs.existsSync(destPath)) {
        // Skip if not merging and destination exists
        continue;
      }
      copyDirRecursive(srcPath, destPath, merge);
    } else {
      if (!merge && fs.existsSync(destPath)) {
        // Skip if not merging and file exists
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean existing root app directory if it exists
if (fs.existsSync('app')) {
  console.log('Cleaning existing app directory...');
  fs.rmSync('app', { recursive: true, force: true });
}

// Create root app directory
console.log('Creating root app directory...');
fs.mkdirSync('app', { recursive: true });

// Copy frontend app content to root app (all routes, pages, layouts)
console.log('Copying frontend app content...');
copyDirRecursive('frontend/app', 'app', true);

// Copy backend API routes to root app/api
console.log('Merging backend API routes...');

const backendApiRoutes = [
  { src: 'backend/app/api/health', dest: 'app/api/health' },
  { src: 'backend/app/api/ingest/upload', dest: 'app/api/ingest/upload' },
  { src: 'backend/app/api/ingest/url', dest: 'app/api/ingest/url' },
  { src: 'backend/app/api/tenant-example', dest: 'app/api/tenant-example' }
];

for (const route of backendApiRoutes) {
  if (fs.existsSync(route.src)) {
    fs.mkdirSync(route.dest, { recursive: true });
    const routeFile = path.join(route.src, 'route.ts');
    if (fs.existsSync(routeFile)) {
      fs.copyFileSync(routeFile, path.join(route.dest, 'route.ts'));
    }
  }
}

// Merge components directories
console.log('Merging components...');
if (fs.existsSync('components')) {
  fs.rmSync('components', { recursive: true, force: true });
}
fs.mkdirSync('components', { recursive: true });
copyDirRecursive('frontend/components', 'components', true);
copyDirRecursive('backend/components', 'components', false);

// Merge lib directories
console.log('Merging lib directories...');
if (fs.existsSync('lib')) {
  fs.rmSync('lib', { recursive: true, force: true });
}
fs.mkdirSync('lib', { recursive: true });
copyDirRecursive('frontend/lib', 'lib', true);
copyDirRecursive('backend/lib', 'lib', false);

// Merge public directories
console.log('Merging public directories...');
if (fs.existsSync('public')) {
  fs.rmSync('public', { recursive: true, force: true });
}
fs.mkdirSync('public', { recursive: true });
if (fs.existsSync('frontend/public')) {
  copyDirRecursive('frontend/public', 'public', true);
}

// Copy assets directories
console.log('Copying assets...');
if (fs.existsSync('assets')) {
  fs.rmSync('assets', { recursive: true, force: true });
}
if (fs.existsSync('frontend/assets')) {
  copyDirRecursive('frontend/assets', 'assets', true);
}
if (fs.existsSync('backend/assets')) {
  if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets', { recursive: true });
  }
  copyDirRecursive('backend/assets', 'assets', false);
}

// Copy types directory
console.log('Copying types...');
if (fs.existsSync('types')) {
  fs.rmSync('types', { recursive: true, force: true });
}
fs.mkdirSync('types', { recursive: true });
copyDirRecursive('frontend/types', 'types', true);
if (fs.existsSync('backend/types')) {
  copyDirRecursive('backend/types', 'types', false);
}

// Copy middleware from frontend (it has more complete auth logic)
console.log('Copying middleware...');
if (fs.existsSync('frontend/middleware.ts')) {
  fs.copyFileSync('frontend/middleware.ts', 'middleware.ts');
}

// Copy auth.ts from frontend if it exists
if (fs.existsSync('frontend/auth.ts')) {
  fs.copyFileSync('frontend/auth.ts', 'auth.ts');
}

console.log('Vercel deployment structure prepared successfully!');
console.log('Structure created:');
console.log('   - app/ (frontend pages + backend API routes)');
console.log('   - components/ (merged UI components)');
console.log('   - lib/ (merged utilities)');
console.log('   - public/ (merged static assets)');
console.log('   - assets/ (fonts and other assets)');
console.log('   - types/ (merged TypeScript types)');
console.log('   - middleware.ts (auth middleware)');
