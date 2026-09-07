import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { mockCandidate } from './services/mockData';
import { CandidateProfile } from './types';

// Module Pages
import { Dashboard } from './pages/Dashboard';
import { CareerNavigator } from './pages/CareerNavigator';
import { SkillGapAnalyzer } from './pages/SkillGapAnalyzer';
import { JobReadinessScore } from './pages/JobReadinessScore';
import { PersonalMentor } from './pages/PersonalMentor';
import { FutureSkillsRadar } from './pages/FutureSkillsRadar';
import { ResumeOpportunity } from './pages/ResumeOpportunity';
import { LocationRecommendations } from './pages/LocationRecommendations';
import { JobDiscovery } from './pages/JobDiscovery';
import { AIInterviewSimulator } from './pages/AIInterviewSimulator';
import { SoftSkillsCoach } from './pages/SoftSkillsCoach';
import { AIJobWatch } from './pages/AIJobWatch';
import { NotificationCenter } from './pages/NotificationCenter';
import { ApplicationTracker } from './pages/ApplicationTracker';
import { LearningHub } from './pages/LearningHub';
import { AIResumeBuilder } from './pages/AIResumeBuilder';
import { AIJobApplicationAssistant } from './pages/AIJobApplicationAssistant';
import { AIPortfolioBuilder } from './pages/AIPortfolioBuilder';
import { EmployerPortal } from './pages/EmployerPortal';
import { TwoSidedMatching } from './pages/TwoSidedMatching';
import { JobTrustSafety } from './pages/JobTrustSafety';
import { IndiaMarketIntelligence } from './pages/IndiaMarketIntelligence';
import { PersonalCareerOS } from './pages/PersonalCareerOS';
import { PerformanceScalability } from './pages/PerformanceScalability';
import { SecurityPrivacyAudit } from './pages/SecurityPrivacyAudit';
import { FullPlatformTesting } from './pages/FullPlatformTesting';
import { ProductionLaunch } from './pages/ProductionLaunch';
import { Step31ProductAudit } from './pages/Step31ProductAudit';
import { RealAIServiceDashboard } from './pages/RealAIServiceDashboard';
import { UsabilityTestDashboard } from './pages/UsabilityTestDashboard';
import { JobMatchingAccuracyDashboard } from './pages/JobMatchingAccuracyDashboard';
import { JobQualityDashboard } from './pages/JobQualityDashboard';
import { CareerUXDashboard } from './pages/CareerUXDashboard';
import { EmployerPilotDashboard } from './pages/EmployerPilotDashboard';
import { AdminAnalyticsDashboard } from './pages/AdminAnalyticsDashboard';
import { MonetizationArchitectureDashboard } from './pages/MonetizationArchitectureDashboard';
import { GrowthReferralDashboard } from './pages/GrowthReferralDashboard';
import { ProductionInfraDashboard } from './pages/ProductionInfraDashboard';
import { PrivacyComplianceDashboard } from './pages/PrivacyComplianceDashboard';
import { ClosedBetaDashboard } from './pages/ClosedBetaDashboard';
import FinalLaunchCommandCenter from './pages/FinalLaunchCommandCenter';

export const App: React.FC = () => {
  const [candidate] = useState<CandidateProfile>(mockCandidate);

  return (
    <Router>
      <Layout candidate={candidate}>
        <Routes>
          <Route path="/" element={<Dashboard candidate={candidate} />} />
          <Route path="/beta" element={<ClosedBetaDashboard />} />
          <Route path="/closed-beta" element={<ClosedBetaDashboard />} />
          <Route path="/final-launch" element={<FinalLaunchCommandCenter />} />
          <Route path="/privacy-compliance" element={<PrivacyComplianceDashboard />} />
          <Route path="/privacy" element={<PrivacyComplianceDashboard />} />
          <Route path="/production-infra" element={<ProductionInfraDashboard />} />
          <Route path="/health" element={<ProductionInfraDashboard />} />
          <Route path="/growth" element={<GrowthReferralDashboard />} />
          <Route path="/monetization" element={<MonetizationArchitectureDashboard />} />
          <Route path="/analytics" element={<AdminAnalyticsDashboard />} />
          <Route path="/employer-pilot" element={<EmployerPilotDashboard />} />
          <Route path="/ux-optimization" element={<CareerUXDashboard />} />
          <Route path="/job-quality" element={<JobQualityDashboard />} />
          <Route path="/matching-accuracy" element={<JobMatchingAccuracyDashboard />} />
          <Route path="/usability-testing" element={<UsabilityTestDashboard />} />
          <Route path="/real-ai" element={<RealAIServiceDashboard />} />
          <Route path="/product-audit" element={<Step31ProductAudit />} />
          <Route path="/launch" element={<ProductionLaunch />} />
          <Route path="/full-testing" element={<FullPlatformTesting />} />
          <Route path="/security-privacy" element={<SecurityPrivacyAudit />} />
          <Route path="/performance" element={<PerformanceScalability />} />
          <Route path="/career-os" element={<PersonalCareerOS candidate={candidate} />} />
          <Route path="/market-intelligence" element={<IndiaMarketIntelligence />} />
          <Route path="/job-safety" element={<JobTrustSafety candidate={candidate} />} />
          <Route path="/two-sided-matching" element={<TwoSidedMatching candidate={candidate} />} />
          <Route path="/employer" element={<EmployerPortal candidate={candidate} />} />
          <Route path="/portfolio" element={<AIPortfolioBuilder candidate={candidate} />} />
          <Route path="/application-assistant" element={<AIJobApplicationAssistant candidate={candidate} />} />
          <Route path="/resume-builder" element={<AIResumeBuilder candidate={candidate} />} />
          <Route path="/learning" element={<LearningHub candidate={candidate} />} />

          <Route path="/applications" element={<ApplicationTracker candidate={candidate} />} />
          <Route path="/notifications" element={<NotificationCenter candidate={candidate} />} />
          <Route path="/job-watch" element={<AIJobWatch candidate={candidate} />} />
          <Route path="/navigator" element={<CareerNavigator candidate={candidate} />} />
          <Route path="/skill-gap" element={<SkillGapAnalyzer candidate={candidate} />} />
          <Route path="/readiness" element={<JobReadinessScore candidate={candidate} />} />
          <Route path="/mentor" element={<PersonalMentor candidate={candidate} />} />
          <Route path="/radar" element={<FutureSkillsRadar candidate={candidate} />} />
          <Route path="/resume-match" element={<ResumeOpportunity candidate={candidate} />} />
          <Route path="/discover" element={<JobDiscovery candidate={candidate} />} />
          <Route path="/location-jobs" element={<JobDiscovery candidate={candidate} />} />
          <Route path="/location-radar" element={<LocationRecommendations candidate={candidate} />} />
          <Route path="/interview-prep" element={<AIInterviewSimulator candidate={candidate} />} />
          <Route path="/soft-skills" element={<SoftSkillsCoach candidate={candidate} />} />
        </Routes>
      </Layout>
    </Router>
  );
};


export default App;
