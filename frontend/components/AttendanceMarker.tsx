
import React, { useState, useRef, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { MOCK_STUDENTS, MOCK_COURSES, GEOLOCATION_THRESHOLD_METERS } from '../constants';
import { VerificationResult } from '../types';

const AttendanceMarker: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>(MOCK_COURSES[0].id);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [locationVerified, setLocationVerified] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("Camera access denied. Please enable permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const verifyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const course = MOCK_COURSES.find(c => c.id === selectedCourse);
        if (!course) return;

        // Simple distance check (Haversine approximation for demo)
        const dist = Math.sqrt(
          Math.pow(latitude - course.coordinates.lat, 2) + 
          Math.pow(longitude - course.coordinates.lng, 2)
        ) * 111320; // degree to meters approx

        setLocationVerified(dist < GEOLOCATION_THRESHOLD_METERS);
      },
      (err) => {
        setError("Could not verify location: " + err.message);
        setLocationVerified(false);
      }
    );
  }, [selectedCourse]);

  const captureAndVerify = async () => {
    if (!selectedStudent || !videoRef.current || !canvasRef.current) {
      setError("Please select a student and ensure camera is active.");
      return;
    }

    setIsVerifying(true);
    setResult(null);
    verifyLocation();

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageBase64 = canvas.toDataURL('image/jpeg');
        const student = MOCK_STUDENTS.find(s => s.id === selectedStudent);
        
        const aiResult = await geminiService.verifyAttendance(imageBase64, student?.name || "");
        setResult(aiResult);
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
      stopCamera();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration & Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h3 className="text-xl font-bold text-slate-800">Attendance Verification</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Course</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MOCK_COURSES.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Student Identification</label>
            <select 
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Student...</option>
              {MOCK_STUDENTS.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            {!stream ? (
              <button 
                onClick={startCamera}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <i className="fas fa-camera"></i> Initialize AI Camera
              </button>
            ) : (
              <button 
                onClick={captureAndVerify}
                disabled={isVerifying || !selectedStudent}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isVerifying || !selectedStudent 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                {isVerifying ? (
                  <><i className="fas fa-spinner fa-spin"></i> Analyzing Face...</>
                ) : (
                  <><i className="fas fa-id-card"></i> Verify & Log Presence</>
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-3">
            <i className="fas fa-exclamation-circle mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className={`p-6 rounded-2xl border-2 animate-in zoom-in duration-300 ${
            result.verified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                result.verified ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                <i className={`fas ${result.verified ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              </div>
              <div>
                <h4 className="font-bold text-lg">{result.verified ? 'Presence Verified' : 'Verification Failed'}</h4>
                <p className="text-sm opacity-80">AI Confidence: {(result.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
            <p className="text-sm mb-4 bg-white/50 p-3 rounded-lg italic">"{result.message}"</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/40 p-3 rounded-lg flex items-center gap-3">
                <i className={`fas fa-map-marker-alt ${locationVerified ? 'text-emerald-600' : 'text-red-500'}`}></i>
                <span className="text-xs font-bold uppercase tracking-wider">Geo-Fence: {locationVerified ? 'PASS' : 'FAIL'}</span>
              </div>
              <div className="bg-white/40 p-3 rounded-lg flex items-center gap-3">
                <i className="fas fa-clock text-indigo-600"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Viewport */}
      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden relative min-h-[400px] flex items-center justify-center border-4 border-slate-800">
        {!stream ? (
          <div className="text-center p-12">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-video-slash text-slate-600 text-3xl"></i>
            </div>
            <p className="text-slate-400 font-medium max-w-xs mx-auto">
              Camera feed is disabled. Start the camera to begin identity verification.
            </p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* AI Overlay Guide */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-indigo-400/50 rounded-full"></div>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded">LIVE FEED</span>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">HD 720P</span>
              </div>
              <div className="absolute bottom-4 right-4 text-white/50 text-xs">
                Scanning for biometric points...
              </div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default AttendanceMarker;
