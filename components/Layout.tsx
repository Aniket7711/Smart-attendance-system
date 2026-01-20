
import React from 'react';
import { CURRENT_USER } from '../constants';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard', roles: [UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT] },
    { id: 'attendance', icon: 'fa-user-check', label: 'Mark Attendance', roles: [UserRole.FACULTY, UserRole.STUDENT] },
    { id: 'courses', icon: 'fa-book', label: 'Courses', roles: [UserRole.FACULTY, UserRole.STUDENT] },
    { id: 'reports', icon: 'fa-file-export', label: 'Reports', roles: [UserRole.ADMIN, UserRole.FACULTY] },
    { id: 'students', icon: 'fa-user-graduate', label: 'Students', roles: [UserRole.ADMIN, UserRole.FACULTY] },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex-col hidden md:flex fixed inset-y-0 shadow-2xl z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-fingerprint text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">OmniPresence</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.filter(item => item.roles.includes(CURRENT_USER.role)).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-500 text-white shadow-lg' 
                  : 'text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-indigo-800">
          <div className="flex items-center gap-3">
            <img src={CURRENT_USER.avatarUrl} alt="User" className="w-10 h-10 rounded-full border-2 border-indigo-400" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{CURRENT_USER.name}</p>
              <p className="text-xs text-indigo-300 capitalize">{CURRENT_USER.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h1>
            <p className="text-slate-500">Welcome back, {CURRENT_USER.name.split(' ')[0]}</p>
          </div>
          <div className="flex gap-4">
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 relative">
              <i className="fas fa-bell"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="md:hidden p-2 bg-white border border-slate-200 rounded-lg text-slate-600">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </header>
        
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
