import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';

const AdminTimetable = () => {
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    subject: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchTimetable(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchInitialData = async () => {
    try {
      const [batchesRes, subjectsRes] = await Promise.all([
        api.get('/batches'),
        api.get('/subjects')
      ]);
      setBatches(batchesRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      toast.error('Failed to load initial data');
    }
  };

  const fetchTimetable = async (batchId) => {
    setLoading(true);
    try {
      const response = await api.get(`/timetables/batch/${batchId}`);
      setTimetable(response.data);
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!selectedBatch) {
      toast.error('Please select a batch first');
      return;
    }

    try {
      await api.post('/timetables', {
        ...newEntry,
        batch: selectedBatch
      });
      toast.success('Class scheduled successfully');
      setIsModalOpen(false);
      fetchTimetable(selectedBatch);
    } catch (error) {
      toast.error('Failed to schedule class');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.delete(`/timetables/${id}`);
        toast.success('Class deleted');
        fetchTimetable(selectedBatch);
      } catch (error) {
        toast.error('Failed to delete class');
      }
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
          <h2 className="text-2xl font-bold text-gray-800">Timetable Management</h2>
          <p className="text-gray-500 mt-1">Schedule classes for your batches.</p>
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
        {selectedBatch && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors h-[42px]"
          >
            <Plus size={20} />
            <span>Add Class</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading schedule...</div>
      ) : selectedBatch ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daysOfWeek.map(day => (
            <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                   <CalendarIcon size={16} className="text-blue-500" />
                   <span>{day}</span>
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {groupedTimetable[day].length} classes
                </span>
              </div>
              <div className="p-4 space-y-3">
                {groupedTimetable[day].length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">No classes scheduled</p>
                ) : (
                  groupedTimetable[day].map(entry => (
                    <div key={entry._id} className="flex flex-col bg-blue-50 rounded-lg p-3 border border-blue-100 relative group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-blue-900 text-sm">{entry.subject?.name}</span>
                        <button 
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between text-xs text-blue-700">
                        <span>{entry.startTime} - {entry.endTime}</span>
                        <span>{entry.teacher?.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Batch Selected</h3>
          <p className="text-gray-500 mt-1">Select a batch from the dropdown above to view or manage its timetable.</p>
        </div>
      )}

      {/* Add Class Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Class">
        <form onSubmit={handleCreateEntry} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={newEntry.subject}
              onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
            >
              <option value="" disabled>Select Subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={newEntry.dayOfWeek}
              onChange={(e) => setNewEntry({ ...newEntry, dayOfWeek: e.target.value })}
            >
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newEntry.startTime}
                onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newEntry.endTime}
                onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTimetable;
