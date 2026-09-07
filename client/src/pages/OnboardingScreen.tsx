import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { UserSession } from '../services/authService';
import { CandidateProfile } from '../types';
import { Rocket, Target, MapPin, Briefcase, ArrowRight } from 'lucide-react';

interface OnboardingScreenProps {
  session: UserSession;
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ session, onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({
    fullName: '',
    headline: '',
    currentLocation: { city: '', state: '', country: 'India', latitude: 0, longitude: 0 },
    preferredWorkType: 'Remote',
    targetRoles: [],
    technicalSkills: [],
    experience: [],
    education: []
  });

  const handleSave = () => {
    // Fill required arrays if empty to avoid crashes in app
    const finalProfile: CandidateProfile = {
      ...(profile as CandidateProfile),
      id: session.id,
      email: `${session.username}@laboria.local`, // Mock email
      phone: '',
      skills: profile.technicalSkills?.map((s: string) => ({ name: s, level: 'Intermediate' })) || [],
      softSkills: [],
      projects: [],
      preferredLocations: [profile.currentLocation?.city || ''],
      yearsOfExperience: 0
    };

    AuthService.saveProfile(finalProfile);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl glass-panel p-8 md:p-12 rounded-2xl border border-gray-800 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
          <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                <Rocket className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">Welcome to Laboria AI</h1>
                <p className="text-gray-400">Let's set up your private career profile.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g. Priya Sharma"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Professional Headline</label>
              <input
                type="text"
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g. Full Stack Developer | React & Node"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!profile.fullName || !profile.headline}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">Career Goals</h1>
                <p className="text-gray-400">What roles and skills are you targeting?</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Target Role</label>
              <input
                type="text"
                onChange={(e) => setProfile({ ...profile, targetRoles: [e.target.value] })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Key Technical Skills (comma separated)</label>
              <input
                type="text"
                onChange={(e) => setProfile({ ...profile, technicalSkills: e.target.value.split(',').map((s: string) => s.trim()) })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g. React, TypeScript, Python"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700">Back</button>
              <button
                onClick={() => setStep(3)}
                className="flex-[2] flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">Location & Preferences</h1>
                <p className="text-gray-400">Where do you want to work?</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
              <input
                type="text"
                onChange={(e) => setProfile({ ...profile, currentLocation: { ...profile.currentLocation!, city: e.target.value } })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g. Bengaluru"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Work Type</label>
              <select
                onChange={(e) => setProfile({ ...profile, preferredWorkType: e.target.value as any })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700">Back</button>
              <button
                onClick={handleSave}
                className="flex-[2] flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl"
              >
                Complete Setup <Rocket className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


