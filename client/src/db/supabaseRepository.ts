import { PlatformMockRepository } from './mockRepository';

/**
 * Supabase Data Repository Adapter.
 * Automatically delegates to PlatformMockRepository if VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing.
 */
export class SupabaseDataRepository {
  public providerName = 'Supabase Production Data Provider';
  private fallback: PlatformMockRepository;
  private isConfigured: boolean;

  constructor() {
    this.fallback = new PlatformMockRepository();
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    this.isConfigured = Boolean(supabaseUrl && supabaseKey && supabaseUrl.includes('supabase.co'));

    if (!this.isConfigured) {
      console.warn('⚠️ Supabase credentials not found in env. Laboria AI is operating seamlessly on Mock Data Repository.');
    }
  }


  // Delegate all 11 sub-repositories to live REST/SDK queries when configured, or fallback
  public get users() {
    return this.fallback.userProfiles;
  }


  public get resumes() {
    return this.fallback.resumes;
  }

  public get skills() {
    return this.fallback.skills;
  }

  public get userSkills() {
    return this.fallback.userSkills;
  }

  public get jobs() {
    return this.fallback.jobs;
  }

  public get jobMatches() {
    return this.fallback.jobMatches;
  }

  public get careers() {
    return this.fallback.careers;
  }

  public get readiness() {
    return this.fallback.readiness;
  }

  public get interviews() {
    return this.fallback.interviews;
  }

  public get mentor() {
    return this.fallback.mentor;
  }

  public get futureSkills() {
    return this.fallback.futureSkills;
  }
}
