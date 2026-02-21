import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Check, Upload, Clock } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [submitContent, setSubmitContent] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/assignments/mine');
      setAssignments(response.data);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const openSubmitModal = (assignment) => {
    setCurrentAssignment(assignment);
    setSubmitContent('');
    setIsModalOpen(true);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/assignments/${currentAssignment._id}/submit`, { content: submitContent });
      toast.success('Assignment submitted successfully');
      setIsModalOpen(false);
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', render: (row) => <span className="font-semibold text-gray-800">{row.title}</span> },
    { header: 'Subject', accessor: 'subject', render: (row) => row.subject?.name },
    { 
      header: 'Due Date', 
      render: (row) => {
        const isLate = new Date(row.dueDate) < new Date() && !row.submission;
        return (
          <span className={isLate ? 'text-red-500 font-medium' : 'text-gray-600'}>
            {new Date(row.dueDate).toLocaleDateString()}
          </span>
        );
      }
    },
    {
      header: 'Status',
      render: (row) => {
        if (!row.submission) {
          const isLate = new Date(row.dueDate) < new Date();
          return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isLate ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
              {isLate ? 'Missing' : 'Pending'}
            </span>
          );
        }
        if (row.submission.status === 'Graded') {
          return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Graded ({row.submission.grade}/100)
            </span>
          );
        }
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Submitted
          </span>
        );
      }
    },
    {
      header: 'Actions',
      render: (row) => {
        if (!row.submission) {
          return (
            <button 
              onClick={() => openSubmitModal(row)}
              className="flex items-center space-x-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} />
              <span>Submit Work</span>
            </button>
          );
        }
        return (
          <div className="flex flex-col text-xs text-gray-500">
            {row.submission.feedback ? (
              <span><strong className="text-gray-700">Feedback:</strong> {row.submission.feedback}</span>
            ) : (
              <span className="flex items-center space-x-1 text-green-600"><Check size={14} /> <span>Done</span></span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Assignments</h2>
        <p className="text-gray-600 mt-1">View pending tasks and submit your work.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading assignments...</div>
        ) : (
          <Table columns={columns} data={assignments} keyExtractor={(row) => row._id} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Assignment">
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">{currentAssignment?.title}</h4>
            <p className="text-xs text-gray-600 mb-2">{currentAssignment?.description}</p>
            <p className="text-xs font-medium text-orange-600 flex items-center space-x-1">
              <Clock size={12} /> 
              <span>Due: {currentAssignment ? new Date(currentAssignment.dueDate).toLocaleDateString() : ''}</span>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Work (Text or Link)</label>
            <p className="text-xs text-gray-500 mb-2">You can type your answer directly or paste a link to a Google Docs/Drive file.</p>
            <textarea
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="5"
              placeholder="Enter your response or paste a URL here..."
              value={submitContent}
              onChange={(e) => setSubmitContent(e.target.value)}
            ></textarea>
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
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Upload size={18} />
              <span>Submit Work</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyAssignments;
