import express from 'express';
import crypto from 'crypto';
import { execSync } from 'child_process';

const app = express();
const port = 3732;
const webhookSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

app.use(express.json());

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature)) {
    return res.status(401).send('Unauthorized');
  }
  
  const event = req.headers['x-github-event'];
  const { repository, ref } = req.body;
  
  // Only trigger on push to main branch
  if (event === 'push' && ref === 'refs/heads/main') {
    console.log(`Received push event for ${repository.name}`);
    
    // Trigger build process
    try {
      console.log('Starting auto-build...');
      execSync('npm run build', { stdio: 'inherit' });
      console.log('Auto-build completed successfully');
    } catch (error) {
      console.error('Auto-build failed:', error.message);
    }
  }
  
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Webhook server running on port ${port}`);
});