import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Table from '../../components/common/Table';

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalDays: 0, presentDays: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      const response = await api.get('/attendance/mine');
      setRecords(response.data.records);
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      header: 'Date', 
      render: (row) => new Date(row.date).toLocaleDateString() 
    },
    { 
      header: 'Batch', 
      render: (row) => row.batch?.name || 'N/A' 
    },
    { 
      header: 'Status', 
      render: (row) => {
        let color = 'bg-gray-100 text-gray-800';
        if (row.status === 'Present') color = 'bg-green-100 text-green-800';
        if (row.status === 'Late') color = 'bg-orange-100 text-orange-800';
        if (row.status === 'Absent') color = 'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
            {row.status}
          </span>
        );
      }
    },
    { 
      header: 'Confirmation', 
      render: (row) => (
        row.isConfirmed 
          ? <span className="text-green-600 font-medium text-sm">Confirmed</span> 
          : <span className="text-orange-500 font-medium text-sm">Pending Review</span>
      ) 
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Attendance</h2>
        <p className="text-gray-600 mt-1">View your attendance history and overall percentage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <span className="text-gray-500 text-sm font-medium">Total Classes (Recorded)</span>
          <span className="text-3xl font-bold text-gray-800 mt-2">{stats.totalDays}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <span className="text-gray-500 text-sm font-medium">Classes Attended</span>
          <span className="text-3xl font-bold text-blue-600 mt-2">{stats.presentDays}</span>
        </div>
        <div className={`rounded-xl shadow-sm border p-6 flex flex-col justify-center ${stats.percentage >= 75 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <span className={`text-sm font-medium ${stats.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>Overall Percentage</span>
          <span className={`text-3xl font-bold mt-2 ${stats.percentage >= 75 ? 'text-green-700' : 'text-red-700'}`}>
            {stats.percentage}%
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance History</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading records...</div>
        ) : (
          <Table columns={columns} data={records} keyExtractor={(row) => row._id} />
        )}
      </div>
    </div>
  );
};

export default MyAttendance;
