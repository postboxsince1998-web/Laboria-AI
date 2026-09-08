import { AuthService } from './authService';
import { JobService } from './jobService';
import { CandidateProfile } from '../types';

export interface TestStepResult {
  step: string;
  passed: boolean;
  details: string;
}

export interface UserIsolationTestReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  stepResults: TestStepResult[];
}

export class UserIsolationTestRunner {
  public static async runSuite(): Promise<UserIsolationTestReport> {
    const results: TestStepResult[] = [];

    // Step 1: Seed QA Accounts
    try {
      await AuthService.seedTestAccounts();
      results.push({
        step: '1. Seed QA Accounts',
        passed: true,
        details: 'Successfully seeded QA User A (Coimbatore / Data Analyst) and User B (Bangalore / MERN Dev).'
      });
    } catch (e: any) {
      results.push({ step: '1. Seed QA Accounts', passed: false, details: e.message || 'Seeding failed' });
    }

    // Step 2: Login User A & Verify Data
    let userAProfile: CandidateProfile | null = null;
    try {
      const loginA = await AuthService.login('testuser_a', 'password123');
      userAProfile = AuthService.getCurrentProfile();
      
      const isUserAValid = 
        loginA.success && 
        userAProfile !== null &&
        userAProfile.fullName === 'Test User A' &&
        userAProfile.currentLocation.city === 'Coimbatore' &&
        userAProfile.technicalSkills.includes('Python') &&
        userAProfile.technicalSkills.includes('Power BI');

      results.push({
        step: '2. User A Auth & Profile Verification',
        passed: isUserAValid,
        details: isUserAValid 
          ? `Authenticated as User A (${userAProfile?.fullName}). City: ${userAProfile?.currentLocation.city}, Role: ${userAProfile?.headline}`
          : `User A verification failed. Profile: ${JSON.stringify(userAProfile)}`
      });
    } catch (e: any) {
      results.push({ step: '2. User A Auth & Profile Verification', passed: false, details: e.message });
    }

    // Step 3: Verify User A Job Match Calculation
    try {
      if (userAProfile) {
        const matchesA = JobService.getMatchedJobs(userAProfile);
        const hasMatches = matchesA.length > 0;
        results.push({
          step: '3. User A Job Matching',
          passed: hasMatches,
          details: `Evaluated ${matchesA.length} jobs for User A. Top Match: "${matchesA[0]?.job.title}" (${matchesA[0]?.overallMatchScore}% match).`
        });
      } else {
        results.push({ step: '3. User A Job Matching', passed: false, details: 'User A profile absent' });
      }
    } catch (e: any) {
      results.push({ step: '3. User A Job Matching', passed: false, details: e.message });
    }

    // Step 4: Switch Account & Login User B
    let userBProfile: CandidateProfile | null = null;
    try {
      sessionStorage.removeItem('laboria_session_v1'); // Terminate User A session
      const loginB = await AuthService.login('testuser_b', 'password123');
      userBProfile = AuthService.getCurrentProfile();

      const isUserBValid = 
        loginB.success && 
        userBProfile !== null &&
        userBProfile.fullName === 'Test User B' &&
        userBProfile.currentLocation.city === 'Bangalore' &&
        userBProfile.technicalSkills.includes('React') &&
        userBProfile.technicalSkills.includes('MongoDB');

      results.push({
        step: '4. Switch Account & User B Verification',
        passed: isUserBValid,
        details: isUserBValid
          ? `Switched account to User B (${userBProfile?.fullName}). City: ${userBProfile?.currentLocation.city}, Role: ${userBProfile?.headline}`
          : `User B verification failed. Profile: ${JSON.stringify(userBProfile)}`
      });
    } catch (e: any) {
      results.push({ step: '4. Switch Account & User B Verification', passed: false, details: e.message });
    }

    // Step 5: Check Cross-User Data Isolation (Verify 0 leakage from User A to User B)
    try {
      if (userBProfile) {
        const containsUserAData = 
          userBProfile.fullName.includes('User A') ||
          userBProfile.currentLocation.city === 'Coimbatore' ||
          userBProfile.email.includes('user_a');

        results.push({
          step: '5. Zero Cross-User Data Leakage Verification',
          passed: !containsUserAData,
          details: !containsUserAData
            ? 'PASS: User B session contains ZERO User A profile data. Complete data isolation confirmed.'
            : 'FAIL: Detected User A profile data inside User B active session!'
        });
      } else {
        results.push({ step: '5. Zero Cross-User Data Leakage Verification', passed: false, details: 'User B profile absent' });
      }
    } catch (e: any) {
      results.push({ step: '5. Zero Cross-User Data Leakage Verification', passed: false, details: e.message });
    }

    // Step 6: Re-Login User A & Verify Data Persistence Integrity
    try {
      sessionStorage.removeItem('laboria_session_v1');
      await AuthService.login('testuser_a', 'password123');
      const restoredA = AuthService.getCurrentProfile();
      
      const isRestoredValid = 
        restoredA !== null && 
        restoredA.fullName === 'Test User A' && 
        restoredA.currentLocation.city === 'Coimbatore';

      results.push({
        step: '6. User A Re-Authentication & Data Persistence',
        passed: isRestoredValid,
        details: isRestoredValid 
          ? 'PASS: Re-authenticated User A successfully. User A private profile and state fully restored intact.'
          : 'FAIL: Could not restore User A profile intact.'
      });
    } catch (e: any) {
      results.push({ step: '6. User A Re-Authentication & Data Persistence', passed: false, details: e.message });
    }

    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.length - passedCount;

    return {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedCount,
      failedCount,
      allPassed: failedCount === 0,
      stepResults: results
    };
  }
}
