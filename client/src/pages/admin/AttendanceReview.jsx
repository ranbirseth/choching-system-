import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Check, X, Edit } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const AttendanceReview = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State for Overrides
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [newStatus, setNewStatus] = useState('Present');

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [selectedBatch, selectedDate]);

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      setBatches(response.data);
      if (response.data.length > 0) {
        setSelectedBatch(response.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load batches');
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/attendance/batch/${selectedBatch}?date=${selectedDate}`);
      setRecords(response.data);
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await api.put(`/attendance/confirm/${id}`);
      toast.success('Attendance confirmed');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to confirm attendance');
    }
  };

  const openOverrideModal = (record) => {
    setCurrentRecord(record);
    setNewStatus(record.status);
    setIsModalOpen(true);
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/override', {
        studentId: currentRecord.student._id,
        batchId: selectedBatch,
        date: selectedDate,
        status: newStatus
      });
      toast.success('Attendance status updated');
      setIsModalOpen(false);
      fetchRecords();
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const columns = [
    { header: 'Student Name', accessor: 'name', render: (row) => row.student?.name },
    { header: 'Email', accessor: 'email', render: (row) => row.student?.email },
    { 
      header: 'Status', 
      render: (row) => {
        let color = 'bg-gray-100 text-gray-800';
        if (row.status === 'Present') color = 'bg-green-100 text-green-800';
        if (row.status === 'Late') color = 'bg-orange-100 text-orange-800';
        if (row.status === 'Absent') color = 'bg-red-100 text-red-800';
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>{row.status}</span>;
      }
    },
    { 
      header: 'Confirmation', 
      render: (row) => (
        row.isConfirmed 
          ? <span className="text-green-600 font-medium text-sm flex items-center space-x-1"><Check size={16}/> <span>Confirmed</span></span> 
          : <span className="text-orange-500 font-medium text-sm">Pending</span>
      ) 
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          {!row.isConfirmed && (
             <button 
               onClick={() => handleConfirm(row._id)} 
               className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors"
               title="Confirm"
             >
               <Check size={16} />
             </button>
          )}
          <button 
            onClick={() => openOverrideModal(row)} 
            className="p-1.5 bg-gray-50 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="Edit Status"
          >
            <Edit size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Attendance Review</h2>
        <p className="text-gray-600 mt-1">Review and confirm attendance records for your batches.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="" disabled>Select a batch</option>
              {batches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading records...</div>
        ) : !selectedBatch ? (
          <div className="text-center py-8 text-gray-500">Please select a batch.</div>
        ) : (
          <Table columns={columns} data={records} keyExtractor={(row) => row._id} />
        )}
      </div>

      {/* Override Status Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Attendance Status">
        <form onSubmit={handleOverrideSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Updating status for <strong>{currentRecord?.student?.name}</strong>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
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
              Save Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceReview;
