import React, { useState } from 'react';
import { MapPin, Navigation, Sparkles, ShieldCheck, Compass, Info } from 'lucide-react';
import { LocationCategory, LocationService } from '../../services/locationService';

export interface MapJobPoint {
  id: string;
  title: string;
  company: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  workType: string;
  profileMatchScore: number;
}

interface InteractiveJobMapProps {
  candidateLocation: { city: string; state: string; latitude: number; longitude: number };
  candidateRadiusKm: number;
  jobs: MapJobPoint[];
  onSelectJob?: (jobId: string) => void;
}

export const InteractiveJobMap: React.FC<InteractiveJobMapProps> = ({
  candidateLocation,
  candidateRadiusKm,
  jobs,
  onSelectJob
}) => {
  const [activeJobId, setActiveJobId] = useState<string | null>(jobs[0]?.id || null);

  // Map bounding box for Indian Tech Hubs (Lat: 12.0 to 29.0, Lon: 72.0 to 80.0)
  const minLat = 11.5;
  const maxLat = 29.5;
  const minLon = 72.0;
  const maxLon = 79.5;

  const getCanvasCoords = (lat: number, lon: number) => {
    // Project Lat/Lon to 0-100% SVG coordinates
    const x = ((lon - minLon) / (maxLon - minLon)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) };
  };

  const candidateCoords = getCanvasCoords(candidateLocation.latitude, candidateLocation.longitude);
  const activeJob = jobs.find((j) => j.id === activeJobId);

  return (
    <div className="glass-card rounded-xl p-5 border border-brand-500/30 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">
              OpenStreetMap Geo-Discovery Radar
            </h3>
            <p className="text-xs text-gray-400">
              Zero-Cost OpenStreetMap compatible map • Candidate Base: <span className="text-white font-semibold">{candidateLocation.city}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" /> Candidate Base
          </span>
          <span className="flex items-center gap-1 text-brand-400 font-semibold ml-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400" /> Job Openings
          </span>
        </div>
      </div>

      {/* Visual Geo Discovery Canvas */}
      <div className="relative w-full h-80 bg-gray-950 rounded-xl overflow-hidden border border-gray-800 shadow-inner flex items-center justify-center">
        {/* OpenStreetMap Grid Tile Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#14b8a6 1px, #0b0f19 1px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />

        {/* Map Watermark Tag */}
        <div className="absolute bottom-2 right-3 z-10 px-2 py-1 rounded bg-black/70 backdrop-blur text-[10px] text-gray-400 border border-gray-800 font-mono">
          © OpenStreetMap contributors (Zero-Cost Tile Data)
        </div>

        {/* Dynamic Radius Indicator */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <circle
            cx={`${candidateCoords.x}%`}
            cy={`${candidateCoords.y}%`}
            r="22%"
            className="fill-emerald-500/5 stroke-emerald-500/30 stroke-dashed"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Candidate Base Marker */}
        <div
          className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style={{ left: `${candidateCoords.x}%`, top: `${candidateCoords.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-gray-950 flex items-center justify-center font-bold text-xs shadow-glow-teal border-2 border-white">
              📍
            </div>
          </div>
          <div className="absolute top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded border border-emerald-500/40 whitespace-nowrap shadow-lg z-30 font-semibold">
            {candidateLocation.city} (Candidate Base)
          </div>
        </div>

        {/* Job Pins */}
        {jobs.map((job) => {
          const coords = getCanvasCoords(job.latitude, job.longitude);
          const isActive = activeJobId === job.id;

          const locationFit = LocationService.evaluateLocationFit(
            {
              currentLocation: { ...candidateLocation, country: 'India' },

              preferredLocations: ['Bengaluru', 'Hyderabad'],
              preferredRadiusKm: candidateRadiusKm,
              willingToRelocate: true,
              remotePreference: true,
              hybridPreference: true,
              officePreference: true
            },

            { ...job, location: `${job.city}, ${job.state}`, workType: job.workType || 'Onsite' } as any
          );



          return (
            <button
              key={job.id}
              onClick={() => {
                setActiveJobId(job.id);
                if (onSelectJob) onSelectJob(job.id);
              }}
              className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                isActive ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold shadow-md border ${
                  isActive
                    ? 'bg-brand-600 text-white border-brand-300 shadow-glow-sm'
                    : 'bg-gray-900/90 text-brand-300 border-brand-500/40 hover:border-brand-400'
                }`}
              >
                <MapPin className="w-3 h-3 text-brand-400" />
                <span>{job.profileMatchScore}% Fit</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Selected Job Popup Details */}
      {activeJob && (
        <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{activeJob.title}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
                {activeJob.company}
              </span>
            </div>
            <p className="text-gray-400 flex items-center gap-2 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {activeJob.city}, {activeJob.state} ({activeJob.workType})
            </p>
          </div>

          <div className="text-right">
            <span className="text-emerald-400 font-bold text-sm block">
              {activeJob.profileMatchScore}% Profile Match
            </span>
            <span className="text-gray-400 text-[11px]">
              {LocationService.evaluateLocationFit(
                {
                  currentLocation: { ...candidateLocation, country: 'India' },

                  preferredLocations: ['Bengaluru'],
                  preferredRadiusKm: candidateRadiusKm,
                  willingToRelocate: true,
                  remotePreference: true,
                  hybridPreference: true,
                  officePreference: true
                },

                { ...activeJob, location: `${activeJob.city}, ${activeJob.state}`, workType: activeJob.workType || 'Onsite' } as any
              ).explanation}


            </span>
          </div>
        </div>
      )}
    </div>
  );
};
