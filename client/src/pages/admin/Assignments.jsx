import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, BookOpen, Clock, Users, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    batch: '',
    subject: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, batchesRes, subjectsRes] = await Promise.all([
        api.get('/assignments/teacher'),
        api.get('/batches'),
        api.get('/subjects'),
      ]);
      setAssignments(assignmentsRes.data);
      setBatches(batchesRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      toast.error('Failed to load assignments data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', newAssignment);
      toast.success('Assignment created successfully');
      setIsModalOpen(false);
      setNewAssignment({ title: '', description: '', batch: '', subject: '', dueDate: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', render: (row) => <span className="font-semibold text-gray-800">{row.title}</span> },
    { header: 'Batch', accessor: 'batch', render: (row) => row.batch?.name },
    { header: 'Subject', accessor: 'subject', render: (row) => row.subject?.name },
    { 
      header: 'Due Date', 
      render: (row) => new Date(row.dueDate).toLocaleDateString()
    },
    {
      header: 'Submissions',
      render: (row) => (
        <button 
          onClick={() => navigate(`/assignments/${row._id}/submissions`)}
          className="flex items-center space-x-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <ExternalLink size={16} />
          <span>View</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Assignment Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Create Assignment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading assignments...</div>
        ) : (
          <Table columns={columns} data={assignments} keyExtractor={(row) => row._id} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Assignment">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newAssignment.batch}
                onChange={(e) => setNewAssignment({ ...newAssignment, batch: e.target.value })}
              >
                <option value="" disabled>Select Batch</option>
                {batches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newAssignment.subject}
                onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
              >
                <option value="" disabled>Select Subject</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={newAssignment.dueDate}
              onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
            />
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
              Create Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;
