import { CandidateProfile } from '../types';

export interface UserSession {
  id: string;
  username: string;
}

export class AuthService {
  private static USERS_KEY = 'laboria_users_v1';
  private static PROFILES_KEY = 'laboria_profiles_v1';
  private static SESSION_KEY = 'laboria_session_v1';

  // Secure SHA-256 password hashing via Web Crypto API
  private static async hashPassword(password: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public static async register(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    if (users.find((u: any) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return { success: false, error: 'Username already exists. Please choose a different username.' };
    }

    const hashedPassword = await this.hashPassword(password);
    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    users.push({
      id: newUserId,
      username: username.trim(),
      passwordHash: hashedPassword, // NEVER store plain text
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    this.setSession({ id: newUserId, username: username.trim() });
    return { success: true };
  }

  public static async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = users.find((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());
    
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
    // Replace window history state to reject browser-back restoration of protected pages
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
      window.location.reload();
    }
  }

  public static switchAccount(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
      window.location.reload();
    }
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
    if (!session) throw new Error("Unauthorized: Cannot save profile without active session");

    const profiles = JSON.parse(localStorage.getItem(this.PROFILES_KEY) || '{}');
    profiles[session.id] = { ...profile, id: session.id }; // Enforce user ownership
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('laboria_profile_update', { detail: profiles[session.id] }));
    }
  }

  // Seed isolated QA Test Accounts strictly according to Part 9 & Part 40 specifications
  public static async seedTestAccounts(): Promise<void> {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    
    // QA USER A: Data Analyst in Coimbatore
    let userA = users.find((u: any) => u.username === 'testuser_a');
    if (!userA) {
      const hashA = await this.hashPassword('password123');
      const idA = 'usr_qa_test_a';
      users.push({ id: idA, username: 'testuser_a', passwordHash: hashA, createdAt: new Date().toISOString() });
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      const profiles = JSON.parse(localStorage.getItem(this.PROFILES_KEY) || '{}');
      profiles[idA] = {
        id: idA,
        fullName: 'Test User A',
        headline: 'Data Analyst | Python, SQL & Power BI Specialist',
        email: 'user_a@test.laboria.ai',
        phone: '+91 90000 11111',
        yearsOfExperience: 3,
        currentLocation: { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558 },
        preferredLocations: ['Coimbatore', 'Chennai', 'Remote'],
        preferredWorkType: 'Hybrid',
        targetRoles: ['Data Analyst', 'BI Specialist', 'Analytics Engineer'],
        skills: [
          { name: 'Python', level: 'Advanced' },
          { name: 'SQL', level: 'Expert' },
          { name: 'Excel', level: 'Advanced' },
          { name: 'Power BI', level: 'Advanced' }
        ],
        technicalSkills: ['Python', 'SQL', 'Excel', 'Power BI', 'Pandas'],
        softSkills: ['Analytical Thinking', 'Data Storytelling', 'Problem Solving'],
        education: [{ degree: 'B.Sc Data Analytics', field: 'Data Science', institution: 'Coimbatore Institute of Tech', year: 2023 }],
        experience: [{ role: 'Junior Data Analyst', company: 'Coimbatore Analytics Corp', duration: '2023 - Present', description: 'Built SQL data pipelines and Power BI dashboards.' }],
        projects: [{ name: 'Retail Sales BI Dashboard', description: 'Analyzed 50k transaction records using Python and Power BI.', link: '#' }],
        certifications: ['Microsoft Certified: Power BI Data Analyst Associate'],
        resumeText: 'Test User A - Experienced Data Analyst proficient in Python, SQL, Excel, and Power BI based in Coimbatore.'
      };
      localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
    }

    // QA USER B: MERN Developer in Bangalore
    let userB = users.find((u: any) => u.username === 'testuser_b');
    if (!userB) {
      const hashB = await this.hashPassword('password123');
      const idB = 'usr_qa_test_b';
      users.push({ id: idB, username: 'testuser_b', passwordHash: hashB, createdAt: new Date().toISOString() });
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      const profiles = JSON.parse(localStorage.getItem(this.PROFILES_KEY) || '{}');
      profiles[idB] = {
        id: idB,
        fullName: 'Test User B',
        headline: 'MERN Developer | React, Node.js, MongoDB & JavaScript',
        email: 'user_b@test.laboria.ai',
        phone: '+91 90000 22222',
        yearsOfExperience: 2,
        currentLocation: { city: 'Bangalore', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
        preferredLocations: ['Bangalore', 'Remote', 'Hyderabad'],
        preferredWorkType: 'Remote',
        targetRoles: ['MERN Developer', 'Full Stack Developer', 'React Engineer'],
        skills: [
          { name: 'React', level: 'Expert' },
          { name: 'Node.js', level: 'Advanced' },
          { name: 'MongoDB', level: 'Intermediate' },
          { name: 'JavaScript', level: 'Expert' }
        ],
        technicalSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express'],
        softSkills: ['Agile Development', 'Team Collaboration'],
        education: [{ degree: 'B.Tech Computer Science', field: 'Software Engineering', institution: 'Bangalore Institute of Tech', year: 2024 }],
        experience: [{ role: 'Frontend React Developer', company: 'Bangalore Softworks', duration: '2024 - Present', description: 'Developed full stack MERN web apps.' }],
        projects: [{ name: 'Full Stack MERN SaaS Platform', description: 'Built React SPA with Node/Express REST API and MongoDB.', link: '#' }],
        certifications: ['Meta Full Stack Developer Certificate'],
        resumeText: 'Test User B - MERN Developer skilled in React, Node.js, MongoDB, and JavaScript based in Bangalore.'
      };
      localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
    }

    sessionStorage.removeItem(this.SESSION_KEY);
  }
}
