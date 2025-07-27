import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = 'd:\\project';
const resumeProject = path.join(projectRoot, 'JunlinsResumeWebsite');
const tetrisProject = path.join(projectRoot, 'TetrisGame');
const distDir = './dist';
const gameDir = path.join(distDir, 'game', 'TetrisGame');

console.log('Starting build process...');

try {
  // 1. Clean and create dist directory
  console.log('Cleaning dist directory...');
  if (fs.existsSync(distDir)) {
    execSync(`rimraf ${distDir}`, { stdio: 'inherit' });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 2. Copy JunlinsResumeWebsite files to dist
  console.log('Copying JunlinsResumeWebsite files...');
  const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) {
      throw new Error(`Source directory does not exist: ${src}`);
    }
    
    const items = fs.readdirSync(src, { withFileTypes: true });
    
    for (const item of items) {
      const srcPath = path.join(src, item.name);
      const destPath = path.join(dest, item.name);
      
      if (item.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  copyDir(resumeProject, path.resolve(distDir));

  // 3. Create game/TetrisGame directory
  console.log('Creating game directory structure...');
  fs.mkdirSync(gameDir, { recursive: true });

  // 4. Build TetrisGame project
  console.log('Building TetrisGame project...');
  execSync('npm run buildforHost', { cwd: tetrisProject, stdio: 'inherit' });

  // 5. Copy TetrisGame dist files to game/TetrisGame
  console.log('Copying TetrisGame build files...');
  const tetrisDistDir = path.join(tetrisProject, 'dist');
  execSync(`xcopy "${tetrisDistDir}\\*" "${path.resolve(gameDir)}\\" /E /I /Y`, { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

