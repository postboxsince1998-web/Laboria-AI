import { Router, Request, Response } from 'express';
import { serverJobsData } from '../data/sampleJobs';
import { matchJobForCandidate, ServerCandidatePayload } from '../services/matchingEngine';

const router = Router();

// GET /api/jobs - List all raw jobs
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, count: serverJobsData.length, data: serverJobsData });
});

// POST /api/jobs/match - Calculate matches for candidate profile
router.post('/match', (req: Request, res: Response) => {
  const candidate: ServerCandidatePayload = req.body;
  if (!candidate || !candidate.skills) {
    return res.status(400).json({ success: false, message: 'Candidate payload with skills is required' });
  }

  const results = serverJobsData
    .map((job) => matchJobForCandidate(candidate, job))
    .sort((a, b) => b.overallScore - a.overallScore); // Primary sort by profile-first overall score

  res.json({
    success: true,
    matchingRule: 'Profile Match (60%) > Distance (20%)',
    data: results
  });
});

export default router;
