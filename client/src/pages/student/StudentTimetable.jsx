import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import api from '../../services/api';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    // Attempt to let students pick a batch if they're in multiple, or just load everything.
    // Since Phase 2 didn't tightly bond User->Batch arrays, we'll ask them to enter/pick a batch similar to Attendance for now.
    // For simplicity, let's just fetch all batches and let them build their view.
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchTimetable(selectedBatch);
    } else {
        setTimetable([]);
        setLoading(false);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
      try {
          const res = await api.get('/batches');
          setBatches(res.data);
      } catch (error) {
          toast.error("Failed to load batches");
      }
  }

  const fetchTimetable = async (batchId) => {
    setLoading(true);
    try {
      const response = await api.get(`/timetables/mine?batchId=${batchId}`);
      setTimetable(response.data);
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  // Group timetable by day
  const groupedTimetable = daysOfWeek.reduce((acc, day) => {
    acc[day] = timetable.filter(entry => entry.dayOfWeek === day);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Timetable</h2>
          <p className="text-gray-500 mt-1">View your weekly class schedule.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-end space-x-4">
        <div className="flex-1 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">-- Choose a Batch --</option>
            {batches.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading schedule...</div>
      ) : !selectedBatch ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
              Please select a batch above to view your schedule.
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daysOfWeek.map(day => (
            <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center space-x-2">
                   <CalendarIcon size={16} />
                   <span>{day}</span>
                </h3>
              </div>
              <div className="p-4 space-y-3 bg-gray-50 h-full min-h-[150px]">
                {groupedTimetable[day].length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">No classes</p>
                ) : (
                  groupedTimetable[day].map(entry => (
                    <div key={entry._id} className="flex flex-col bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <span className="font-bold text-gray-800">{entry.subject?.name}</span>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-600 font-medium">
                        <span className="flex items-center space-x-1">
                            <Clock size={12} className="text-blue-500"/>
                            <span>{entry.startTime} - {entry.endTime}</span>
                        </span>
                        <span>{entry.teacher?.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentTimetable;
