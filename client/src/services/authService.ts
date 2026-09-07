import { CandidateProfile } from '../types';

export interface UserSession {
  id: string;
  username: string;
}

export class AuthService {
  private static USERS_KEY = 'laboria_users_v1';
  private static PROFILES_KEY = 'laboria_profiles_v1';
  private static SESSION_KEY = 'laboria_session_v1';

  // Secure SHA-256 hashing for passwords
  private static async hashPassword(password: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public static async register(username: string, password: string):Promise<{ success: boolean; error?: string }> {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    if (users.find((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Username already exists' };
    }

    const hashedPassword = await this.hashPassword(password);
    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2,8)}`;
    
    users.push({
      id: newUserId,
      username,
      passwordHash: hashedPassword, // NEVER store plain text
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    // Automatically log in
    this.setSession({ id: newUserId, username });
    return { success: true };
  }

  public static async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const hashedPassword = await this.hashPassword(password);
    if (user.passwordHash !== hashedPassword) {
      return { success: false, error: 'Invalid username or password' };
    }

    this.setSession({ id: user.id, username: user.username });
    return { success: true };
  }

  public static logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  private static setSession(user: UserSession): void {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  }

  public static getCurrentSession(): UserSession | null {
    const data = sessionStorage.getItem(this.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }

  public static getCurrentProfile(): CandidateProfile | null {
    const session = this.getCurrentSession();
    if (!session) return null;

    const profiles = JSON.parse(localStorage.getItem(this.PROFILES_KEY) || '{}');
    return profiles[session.id] || null;
  }

  public static saveProfile(profile: CandidateProfile): void {
    const session = this.getCurrentSession();
    if (!session) throw new Error("Unauthorized");

    const profiles = JSON.parse(localStorage.getItem(this.PROFILES_KEY) || '{}');
    profiles[session.id] = { ...profile, id: session.id }; // Enforce ownership
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
  }

  // Generate test accounts if they don't exist
  public static async seedTestAccounts() {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    if (!users.find((u:any) => u.username === 'testuser_a')) {
      await this.register('testuser_a', 'password123');
      const session = this.getCurrentSession();
      if(session) {
        this.saveProfile({
          id: session.id,
          headline: 'Data Analyst', targetRoles: ['Data Analyst'], currentLocation: { city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 0, longitude: 0 }, preferredLocations: [], preferredWorkType: 'Remote', skills: [], education: [], experience: [], projects: [], certifications: [], resumeText: '', fullName: 'Test User A',
          title: 'Data Analyst',
          email: 'a@test.laboria.ai',
          phone: '555-0100',
          location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
          technicalSkills: ['Python', 'SQL', 'Tableau', 'Pandas'],
          softSkills: ['Analytical', 'Communication'],
          yearsOfExperience: 3,
          resumeUrl: 'test_a_resume.pdf'
        });
      }
    }
    if (!users.find((u:any) => u.username === 'testuser_b')) {
      await this.register('testuser_b', 'password123');
      const session = this.getCurrentSession();
      if(session) {
        this.saveProfile({
          id: session.id,
          headline: 'MERN Developer', targetRoles: ['MERN Developer'], currentLocation: { city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 0, longitude: 0 }, preferredLocations: [], preferredWorkType: 'Remote', skills: [], education: [], experience: [], projects: [], certifications: [], resumeText: '', fullName: 'Test User B',
          title: 'MERN Developer',
          email: 'b@test.laboria.ai',
          phone: '555-0200',
          location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
          technicalSkills: ['MongoDB', 'Express', 'React', 'Node.js'],
          softSkills: ['Agile', 'Teamwork'],
          yearsOfExperience: 2,
          resumeUrl: 'test_b_resume.pdf'
        });
      }
    }
    this.logout(); // ensure clean state
  }
}

