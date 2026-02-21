import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Check, Download } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const SubmissionsReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grading Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get(`/assignments/${id}/submissions`);
      setSubmissions(response.data);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const openGradeModal = (sub) => {
    setCurrentSubmission(sub);
    setGradeData({ 
      grade: sub.grade || '', 
      feedback: sub.feedback || '' 
    });
    setIsModalOpen(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assignments/submissions/${currentSubmission._id}/grade`, gradeData);
      toast.success('Submission graded successfully');
      setIsModalOpen(false);
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to submit grade');
    }
  };

  const columns = [
    { header: 'Student Name', accessor: 'name', render: (row) => row.student?.name },
    { 
      header: 'Submission Content', 
      render: (row) => {
        // Quick check if the content is a URL
        const isUrl = row.content.startsWith('http://') || row.content.startsWith('https://');
        return isUrl ? (
          <a href={row.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
            <Download size={16} /> <span>Open Link</span>
          </a>
        ) : (
          <span className="text-gray-600 truncate block max-w-xs">{row.content}</span>
        );
      } 
    },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${row.status === 'Graded' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Grade', accessor: 'grade', render: (row) => row.grade ? `${row.grade}/100` : '-' },
    {
      header: 'Actions',
      render: (row) => (
        <button 
          onClick={() => openGradeModal(row)}
          className="text-blue-600 hover:text-blue-800 transition-colors font-medium text-sm"
        >
          {row.status === 'Graded' ? 'Edit Grade' : 'Grade Submission'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/assignments')} className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Review Submissions</h2>
          <p className="text-gray-500 mt-1">Grade student work and provide feedback.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading submissions...</div>
        ) : (
          <Table columns={columns} data={submissions} keyExtractor={(row) => row._id} />
        )}
      </div>

      {/* Grade Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Grade Student Submission">
        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Student's Work:</h4>
            {currentSubmission?.content.startsWith('http') ? (
              <a href={currentSubmission?.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm break-all">
                {currentSubmission?.content}
              </a>
            ) : (
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{currentSubmission?.content}</p>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-4 items-center">
            <label className="col-span-1 text-sm font-medium text-gray-700">Score (/100)</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={gradeData.grade}
              onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
              value={gradeData.feedback}
              onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
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
              <Check size={18} />
              <span>Submit Grade</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubmissionsReview;
