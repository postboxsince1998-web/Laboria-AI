import React from 'react';
import { RecommendedCareerPath } from '../../services/careerNavigatorService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CheckCircle2, AlertCircle, TrendingUp, Clock, BookOpen } from 'lucide-react';

interface CareerComparisonProps {
  careers: RecommendedCareerPath[];
  onClose: () => void;
}

export const CareerComparisonView: React.FC<CareerComparisonProps> = ({ careers, onClose }) => {
  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <h3 className="text-base font-bold text-white font-display">
          Side-by-Side Multi-Career Comparison ({careers.length} Selected)
        </h3>
        <Button size="sm" variant="outline" onClick={onClose}>
          Close Comparison
        </Button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {careers.map((car) => (
          <div
            key={car.id}
            className="glass-card rounded-xl p-4 border border-brand-500/30 space-y-4 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="space-y-2">
              <Badge variant="purple">{car.category}</Badge>
              <h4 className="text-base font-bold text-white font-display">{car.title}</h4>
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-extrabold text-brand-300 font-display">
                  {car.careerMatchScore}% Fit
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> {car.futurePotential.growthRate}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Salary in India: <span className="text-white font-semibold">{car.futurePotential.salaryRangeIndia}</span></p>
            </div>

            {/* Possessed Skills */}
            <div className="space-y-1.5 pt-2 border-t border-gray-800">
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                ✓ Possessed Skills ({car.possessedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {car.possessedSkills.map((sk) => (
                  <Badge key={sk} variant="success">✓ {sk}</Badge>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="space-y-1.5 pt-2 border-t border-gray-800">
              <span className="font-semibold text-rose-400 flex items-center gap-1">
                ⚠ Skills to Acquire ({car.missingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {car.missingSkills.map((sk) => (
                  <Badge key={sk} variant="match-low">⚠ {sk}</Badge>
                ))}
              </div>
            </div>

            {/* Roadmap Duration */}
            <div className="pt-2 border-t border-gray-800 space-y-1 text-gray-300">
              <span className="font-semibold text-brand-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Total Transition Duration:
              </span>
              <p className="text-white font-bold">{car.learningRoadmap.map(r=>r.duration).join(' + ')}</p>
            </div>

            {/* Recommended Portfolio Project */}
            <div className="pt-2 border-t border-gray-800 space-y-1 text-gray-300">
              <span className="font-semibold text-accent-teal flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Portfolio Project:
              </span>
              <p className="text-gray-200 text-[11px] font-semibold">{car.recommendedProjects[0]?.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
