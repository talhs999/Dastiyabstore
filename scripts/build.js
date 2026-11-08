const fs = require('fs');
const { execSync } = require('child_process');

// 1. Ensure production env file is copied if .env is missing
if (fs.existsSync('.env.production') && !fs.existsSync('.env')) {
  fs.copyFileSync('.env.production', '.env');
}

// 2. Set memory and threadpool limits to fit Hostinger thread limits and prevent OOM
process.env.UV_THREADPOOL_SIZE = '4';
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=4096`.trim();

// 3. Generate Prisma client
console.log('Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

// 4. Build Next.js with webpack
console.log('Building Next.js application...');
execSync('npx next build --webpack', { stdio: 'inherit', env: process.env });

