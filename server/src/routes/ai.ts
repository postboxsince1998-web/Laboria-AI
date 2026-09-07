import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/ai/mentor-chat
router.post('/mentor-chat', async (req: Request, res: Response) => {
  const { userMessage, candidateName, skills } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.length > 5) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are Laboria AI Career Mentor for ${candidateName} (Skills: ${skills?.join(', ')}). Question: ${userMessage}` }] }]
        })
      });
      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return res.json({ success: true, provider: 'Google Gemini API (Live)', reply });
    } catch (err) {
      console.error('Gemini error on server, falling back to mock provider');
    }
  }

  // Development Mock Provider
  res.json({
    success: true,
    provider: 'Development Mock Provider (Zero-Cost)',
    reply: `As your Laboria AI mentor, I advise focusing on quantifying achievements in ${skills?.slice(0,2).join(' & ') || 'your core stack'}. Recruiters in India prioritize concrete metrics like latency reductions and system throughput.`
  });
});

export default router;
