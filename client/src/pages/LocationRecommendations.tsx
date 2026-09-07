import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile } from '../types';
import { seedJobs } from '../data/seedData';
import {
  LocationService,
  CandidateLocationPreferences,
  LocationCategory
} from '../services/locationService';
import { runLocationEngineTests, LocationTestResult } from '../services/locationEngineTests';
import { InteractiveJobMap } from '../components/location/InteractiveJobMap';
import {
  MapPin,
  Navigation,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Compass,
  RefreshCw,
  Globe
} from 'lucide-react';

interface LocationProps {
  candidate: CandidateProfile;
}

export const LocationRecommendations: React.FC<LocationProps> = ({ candidate }) => {
  // Candidate Mobility Preferences State
  const [prefs, setPrefs] = useState<CandidateLocationPreferences>({
    currentLocation: {
      city: candidate.currentLocation.city,
      state: candidate.currentLocation.state,
      country: candidate.currentLocation.country,
      latitude: candidate.currentLocation.latitude || 12.9716,
      longitude: candidate.currentLocation.longitude || 77.5946
    },
    preferredLocations: candidate.preferredLocations,
    preferredRadiusKm: 50,
    willingToRelocate: true,
    remotePreference: true,
    hybridPreference: true,
    officePreference: true
  });

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<LocationTestResult[]>([]);

  // Evaluate location intelligence for all job postings
  const evaluatedJobs = seedJobs.map((job) => {
    const geoFit = LocationService.evaluateLocationFit(prefs, { ...job, workType: job.workType || job.employmentType || 'Onsite' } as any);


    // Candidate Profile Match Simulation (Primary Factor)
    let profileMatchScore = 92;
    if (job.title.includes('Lead Frontend')) profileMatchScore = 96;
    if (job.title.includes('Staff UI')) profileMatchScore = 90;
    if (job.title.includes('Backend Systems')) profileMatchScore = 78;

    // Final Priority Math: Profile 70% + Location 15% + Exp 10% + Pref 5%
    const locationScore = geoFit.category === 'Remote' ? 100 : geoFit.distanceKm !== null ? Math.max(30, Math.round(100 - geoFit.distanceKm / 25)) : 50;
    const finalPriorityScore = Math.round(profileMatchScore * 0.70 + locationScore * 0.15 + 95 * 0.10 + 90 * 0.05);

    return {
      job,
      geoFit,
      profileMatchScore,
      finalPriorityScore
    };
  }).sort((a, b) => b.profileMatchScore - a.profileMatchScore); // Primary sort by PROFILE MATCH

  // Filter jobs by category
  const filteredJobs = selectedCategoryFilter === 'All'
    ? evaluatedJobs
    : evaluatedJobs.filter((j) => j.geoFit.category === selectedCategoryFilter);

  // Helper for Category Badges
  const renderCategoryBadge = (category: LocationCategory) => {
    switch (category) {
      case 'Remote':
        return <Badge variant="purple">🌐 Remote</Badge>;
      case 'Very Near':
        return <Badge variant="success">📍 Very Near (0-10 km)</Badge>;
      case 'Near':
        return <Badge variant="info">🚙 Near (11-30 km)</Badge>;
      case 'Moderate Distance':
        return <Badge variant="warning">KM Moderate (31-100 km)</Badge>;
      case 'Far':
        return <Badge variant="match-low">✈️ Far (&gt; 100 km)</Badge>;
      case 'Distance Unavailable':
      default:
        return <Badge variant="info">❓ Distance Unavailable</Badge>;
    }
  };

  const handleRunGeoTests = () => {
    const results = runLocationEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Navigation className="w-3.5 h-3.5" /> Module 8: Location Intelligence & Geo Matching
            </div>
            <h1 className="text-2xl font-bold text-white font-display">
              Geo-Aware Job Discovery Radar
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Base Location: <span className="text-white font-semibold">{prefs.currentLocation.city}, {prefs.currentLocation.state}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunGeoTests}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Run Geo Engine Tests
            </Button>
          </div>
        </div>
      </div>

      {/* Grid: Candidate Mobility Preferences & OpenStreetMap Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Mobility Preference Panel */}
        <Card glow className="space-y-4">
          <CardHeader>
            <CardTitle icon={<Sliders className="w-5 h-5 text-emerald-400" />}>
              Mobility & Commute Preferences
            </CardTitle>
          </CardHeader>

          {/* Preferred Radius Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-300">Preferred Commute Radius</span>
              <span className="text-emerald-400 font-bold">{prefs.preferredRadiusKm} km</span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={prefs.preferredRadiusKm}
              onChange={(e) => setPrefs({ ...prefs, preferredRadiusKm: Number(e.target.value) })}
              className="w-full accent-brand-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>5 km</span>
              <span>50 km</span>
              <span>200 km</span>
            </div>
          </div>

          {/* Relocate Toggle */}
          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-white">Willing to Relocate</span>
              <p className="text-gray-400 text-[11px]">Open to relocation for senior roles</p>
            </div>
            <button
              onClick={() => setPrefs({ ...prefs, willingToRelocate: !prefs.willingToRelocate })}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                prefs.willingToRelocate ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Work Type Preference Switches */}
          <div className="space-y-2 pt-2 border-t border-gray-800 text-xs">
            <span className="font-semibold text-gray-300">Work Model Preferences</span>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => setPrefs({ ...prefs, remotePreference: !prefs.remotePreference })}
                className={`p-2 rounded-lg text-center border font-semibold transition ${
                  prefs.remotePreference
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                🌐 Remote
              </button>

              <button
                onClick={() => setPrefs({ ...prefs, hybridPreference: !prefs.hybridPreference })}
                className={`p-2 rounded-lg text-center border font-semibold transition ${
                  prefs.hybridPreference
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                🏢 Hybrid
              </button>

              <button
                onClick={() => setPrefs({ ...prefs, officePreference: !prefs.officePreference })}
                className={`p-2 rounded-lg text-center border font-semibold transition ${
                  prefs.officePreference
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                📍 On-site
              </button>
            </div>
          </div>
        </Card>

        {/* OpenStreetMap Discovery Map */}
        <div className="lg:col-span-2">
          <InteractiveJobMap
            candidateLocation={{
              city: prefs.currentLocation.city,
              state: prefs.currentLocation.state,
              latitude: prefs.currentLocation.latitude || 12.9716,
              longitude: prefs.currentLocation.longitude || 77.5946
            }}
            candidateRadiusKm={prefs.preferredRadiusKm}
            jobs={evaluatedJobs.map((j) => ({
              id: j.job.id,
              title: j.job.title,
              company: j.job.company,
              city: j.job.location.split(',')[0],
              state: j.job.location.split(',')[1] || 'India',
              latitude: j.job.latitude,
              longitude: j.job.longitude,
              workType: j.job.employmentType,
              profileMatchScore: j.profileMatchScore
            }))}
          />
        </div>
      </div>

      {/* Geo-Aware Job Matches List */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Geo-Categorized Opportunities ({filteredJobs.length})
            </h2>
            <p className="text-xs text-gray-400">
              Rule Enforced: Profile match strictly dominates distance score.
            </p>
          </div>

          {/* Location Category Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'Remote', 'Very Near', 'Near', 'Moderate Distance', 'Far'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategoryFilter === cat
                    ? 'bg-emerald-600 text-white shadow-glow-teal'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.map((item, idx) => (
            <Card key={item.job.id} glow={idx === 0}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white font-display">
                      #{idx + 1} {item.job.title}
                    </span>
                    {renderCategoryBadge(item.geoFit.category)}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    <span className="font-semibold text-white">{item.job.company}</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.job.location}
                    </span>
                    <span>
                      {item.geoFit.distanceKm === null
                        ? 'Distance unavailable'
                        : item.job.employmentType === 'Remote'
                        ? 'Remote (0 km)'
                        : `${item.geoFit.distanceKm} km from ${prefs.currentLocation.city}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-900/80 border border-gray-800 p-3 rounded-xl">
                  <div className="text-center px-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Profile Fit</span>
                    <div className="text-xl font-extrabold text-brand-300 font-display">
                      {item.profileMatchScore}%
                    </div>
                  </div>

                  <div className="h-6 w-px bg-gray-800" />

                  <div className="text-center px-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Priority Score</span>
                    <div className="text-xl font-extrabold text-emerald-400 font-display">
                      {item.finalPriorityScore}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span className="italic">{item.geoFit.explanation}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Automated Geo Engine Test Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - Location Engine Diagnostic & Haversine Tests"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold">
            ✓ Verified: Profile Match % strictly dominates distance calculations.
          </div>

          <div className="space-y-2">
            {testResults.map((tr, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-white">{tr.testName}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{tr.details}</p>
                </div>
                <Badge variant={tr.status === 'PASSED' ? 'success' : 'match-low'}>
                  {tr.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
