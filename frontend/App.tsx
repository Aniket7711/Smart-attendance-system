
import React, { useState, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendanceMarker from './components/AttendanceMarker';
import { MOCK_STUDENTS } from './constants';
import { User } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<User[]>(MOCK_STUDENTS);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleImageUpload = (studentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, avatarUrl: imageUrl } : s
      ));
    }
  };

  const triggerUpload = (studentId: string) => {
    fileInputRefs.current[studentId]?.click();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'attendance':
        return <AttendanceMarker />;
      case 'students':
        return (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Student Roster</h3>
              <p className="text-sm text-slate-500">Click on an avatar to update the profile picture.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {students.map(s => (
                <div key={s.id} className="p-4 border border-slate-100 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow group relative">
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => triggerUpload(s.id)}
                  >
                    <img 
                      src={s.avatarUrl} 
                      alt={s.name} 
                      className="w-16 h-16 rounded-xl object-cover border-2 border-transparent group-hover:border-indigo-500 transition-all" 
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fas fa-camera text-white text-xs"></i>
                    </div>
                    <input
                      type="file"
                      ref={el => fileInputRefs.current[s.id] = el}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(s.id, e)}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{s.name}</h4>
                    <p className="text-sm text-slate-500">{s.studentId} • {s.department}</p>
                    <div className="mt-2 flex gap-1">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.avatarUrl?.includes('picsum') ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'}`}>
                         {s.avatarUrl?.includes('picsum') ? 'Default Avatar' : 'Custom Photo'}
                       </span>
                       <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded">Face ID Ready</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'CS101: AI Intro', room: 'Hall A1', time: '09:00 - 10:30', active: true },
              { name: 'CS202: Data Structures', room: 'Lab 4', time: '11:00 - 12:30', active: false },
              { name: 'CS305: Network Security', room: 'Hall B2', time: '14:00 - 15:30', active: false },
            ].map((course, i) => (
              <div key={i} className={`p-6 rounded-2xl border-2 transition-all ${course.active ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-slate-800">{course.name}</h4>
                  {course.active && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">ONGOING</span>}
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><i className="fas fa-map-marker-alt w-5"></i> {course.room}</p>
                  <p><i className="fas fa-clock w-5"></i> {course.time}</p>
                </div>
                <button className={`mt-6 w-full py-2 rounded-lg font-semibold transition-colors ${course.active ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  View Attendance Details
                </button>
              </div>
            ))}
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-file-export text-indigo-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Generate Attendance Reports</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Select criteria to export historical attendance data in CSV or PDF format for university audits.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center gap-2 justify-center bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                <i className="fas fa-file-csv"></i> Export CSV
              </button>
              <button className="flex items-center gap-2 justify-center bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                <i className="fas fa-file-pdf"></i> Export PDF
              </button>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
