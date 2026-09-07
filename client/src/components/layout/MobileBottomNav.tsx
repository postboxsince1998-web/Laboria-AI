import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Cpu, Bot, Briefcase } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Jobs', path: '/discover', icon: Search },
    { name: 'Career OS', path: '/career-os', icon: Cpu },
    { name: 'AI Mentor', path: '/mentor', icon: Bot },
    { name: 'Apps', path: '/applications', icon: Briefcase }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 shadow-2xl px-2 py-1.5"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/60 font-medium'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
