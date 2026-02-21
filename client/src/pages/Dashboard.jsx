import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, BookOpen, Clock, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalBatches: 0,
    totalSubjects: 0,
    pendingAdmissionsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'Admin' || user?.role === 'Teacher') {
      fetchStats();
    } else {
      setLoading(false); // Student dashboard doesn't use these stats for now
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      // In a real app we might ask them to select a batch if they have multiple, 
      // but for V1 we can assume the backend or a prompt handles it. 
      // We will prompt for batch ID or fetch their batches first.
      const batchId = window.prompt("Enter your Batch ID to mark attendance:");
      if (!batchId) return;

      const res = await api.post('/attendance/mark', { batchId });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome Back, {user?.name}!</h3>
        <p className="text-gray-600">
          This is the central dashboard for the Coaching Center Management System. 
        </p>
      </div>
      
      {(user?.role === 'Admin' || user?.role === 'Teacher') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Students" 
            value={stats.totalStudents} 
            icon={<Users className="text-blue-500" size={24} />} 
          />
          <StatCard 
            title="Active Batches" 
            value={stats.totalBatches} 
            icon={<Layers className="text-purple-500" size={24} />} 
          />
          <StatCard 
            title="Subjects" 
            value={stats.totalSubjects} 
            icon={<BookOpen className="text-green-500" size={24} />} 
          />
          <StatCard 
            title="Pending Admissions" 
            value={stats.pendingAdmissionsCount} 
            icon={<Clock className="text-orange-500" size={24} />} 
          />
        </div>
      )}

      {user?.role === 'Student' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Today's Attendance</h4>
              <p className="text-sm text-gray-500 mt-1">Mark your attendance for your batch today. You can only do this once.</p>
            </div>
            <button 
              onClick={handleMarkAttendance}
              className="mt-4 md:mt-0 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Mark Present
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Recent Activity</h4>
            <p className="text-gray-500 italic">No recent activity to show yet. Announcements and assignments will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
    <div className="p-3 bg-gray-50 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h4 className="text-2xl font-bold text-gray-800 mt-1">{value}</h4>
    </div>
  </div>
);

export default Dashboard;
