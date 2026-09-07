import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jobsRouter from './routes/jobs';
import aiRouter from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Laboria AI Server',
    tagline: 'Stop searching. Start matching.',
    aiProvider: process.env.GEMINI_API_KEY ? 'Google Gemini API (Live)' : 'Development Mock Provider (Zero-Cost)'
  });
});

// API Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/ai', aiRouter);

app.listen(PORT, () => {
  console.log(`🚀 Laboria AI Server running on http://localhost:${PORT}`);
});
