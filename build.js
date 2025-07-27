import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const tempProjectDir = './tempproject';
const resumeRepoUrl = 'https://github.com/Jeffreecoding/JunlinsResumeWebsite.git';
const tetrisRepoUrl = 'https://github.com/Jeffreecoding/TetrisGame.git';
const resumeProject = path.join(tempProjectDir, 'JunlinsResumeWebsite');
const tetrisProject = path.join(tempProjectDir, 'TetrisGame');
const distDir = './dist';
const gameDir = path.join(distDir, 'game', 'TetrisGame');

// Check for GitHub token
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error('Error: GITHUB_TOKEN environment variable is required for private repositories');
  console.log('Please set GITHUB_TOKEN with your GitHub Personal Access Token');
  process.exit(1);
}

const authenticatedResumeUrl = `https://${githubToken}@github.com/Jeffreecoding/JunlinsResumeWebsite.git`;
const authenticatedTetrisUrl = `https://${githubToken}@github.com/Jeffreecoding/TetrisGame.git`;

// Setup temp project directory and clone/update repositories
console.log('Setting up temporary project directory...');
if (!fs.existsSync(tempProjectDir)) {
  fs.mkdirSync(tempProjectDir, { recursive: true });
}

// Handle JunlinsResumeWebsite repository
if (!fs.existsSync(resumeProject)) {
  console.log('Cloning JunlinsResumeWebsite repository...');
  execSync(`git clone ${authenticatedResumeUrl}`, { cwd: tempProjectDir, stdio: 'inherit' });
} else {
  console.log('Updating JunlinsResumeWebsite repository...');
  execSync('git fetch origin && git reset --hard origin/main', { cwd: resumeProject, stdio: 'inherit' });
}

// Handle TetrisGame repository
if (!fs.existsSync(tetrisProject)) {
  console.log('Cloning TetrisGame repository...');
  execSync(`git clone ${authenticatedTetrisUrl}`, { cwd: tempProjectDir, stdio: 'inherit' });
  console.log('Installing TetrisGame dependencies...');
  execSync('npm install', { cwd: tetrisProject, stdio: 'inherit' });
} else {
  console.log('Updating TetrisGame repository...');
  execSync('git fetch origin && git reset --hard origin/main', { cwd: tetrisProject, stdio: 'inherit' });
  console.log('Installing/updating TetrisGame dependencies...');
  execSync('npm install', { cwd: tetrisProject, stdio: 'inherit' });
}

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
  
  // Clean up temporary project directory
  console.log('Cleaning up temporary files...');
  execSync(`rimraf ${tempProjectDir}`, { stdio: 'inherit' });
  console.log('Temporary files cleaned up.');
  
} catch (error) {
  console.error('Build failed:', error.message);
  
  // Clean up temporary project directory even on failure
  console.log('Cleaning up temporary files...');
  if (fs.existsSync(tempProjectDir)) {
    execSync(`rimraf ${tempProjectDir}`, { stdio: 'inherit' });
  }
  
  process.exit(1);
}







