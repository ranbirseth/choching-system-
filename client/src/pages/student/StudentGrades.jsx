import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Award, Percent, BookOpen } from 'lucide-react';
import api from '../../services/api';

const StudentGrades = () => {
  const [data, setData] = useState({
      averageGrade: 0,
      totalGradedAssignments: 0,
      attendancePercentage: 0,
      recentGrades: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await api.get('/grades/mine');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load grades summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return <div className="p-6 text-center text-gray-500">Loading your performance summary...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Grades & Performance</h2>
        <p className="text-gray-600 mt-1">Overview of your academic standing.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Award size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Average Grade</h3>
            <span className="text-3xl font-bold text-gray-800">{data.averageGrade}<span className="text-lg text-gray-500 font-normal">/100</span></span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <BookOpen size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Assignments Graded</h3>
            <span className="text-3xl font-bold text-gray-800">{data.totalGradedAssignments}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                <Percent size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Attendance</h3>
            <span className="text-3xl font-bold text-gray-800">{data.attendancePercentage}%</span>
        </div>
      </div>

      {/* Recent Grades Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Completed Assignments</h3>
        </div>
        {data.recentGrades.length === 0 ? (
            <div className="p-8 text-center text-gray-500">You don't have any graded assignments yet.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-medium border-b border-gray-100">Assignment</th>
                            <th className="px-6 py-4 font-medium border-b border-gray-100">Due Date</th>
                            <th className="px-6 py-4 font-medium border-b border-gray-100">Score</th>
                            <th className="px-6 py-4 font-medium border-b border-gray-100">Feedback</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {data.recentGrades.map(sub => (
                             <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                                 <td className="px-6 py-4 font-medium text-gray-900">{sub.assignment?.title}</td>
                                 <td className="px-6 py-4 text-gray-500">
                                     {new Date(sub.assignment?.dueDate).toLocaleDateString()}
                                 </td>
                                 <td className="px-6 py-4">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                         sub.grade >= 80 ? 'bg-green-100 text-green-800' : 
                                         sub.grade >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                     }`}>
                                         {sub.grade} / 100
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                     {sub.feedback || "-"}
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default StudentGrades;
