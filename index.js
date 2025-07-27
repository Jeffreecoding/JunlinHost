import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3731;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '/dist')));

// Handle all routes by serving the index.html (but only for non-asset requests)
app.get('*', (req, res, next) => {
  // Skip if it's a request for assets (js, css, images, etc.)
  if (req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Tetris game server running at http://localhost:${port}`);
});
