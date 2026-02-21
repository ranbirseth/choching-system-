import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState({ name: '', code: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (subject = null) => {
    if (subject) {
      setCurrentSubject(subject);
      setIsEditing(true);
    } else {
      setCurrentSubject({ name: '', code: '', description: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSubject({ name: '', code: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/subjects/${currentSubject._id}`, currentSubject);
        toast.success('Subject updated successfully');
      } else {
        await api.post('/subjects', currentSubject);
        toast.success('Subject created successfully');
      }
      fetchSubjects();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.delete(`/subjects/${id}`);
        toast.success('Subject deleted successfully');
        fetchSubjects();
      } catch (error) {
        toast.error('Failed to delete subject');
      }
    }
  };

  const columns = [
    { header: 'Subject Name', accessor: 'name' },
    { header: 'Subject Code', accessor: 'code' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-3">
          <button onClick={() => openModal(row)} className="text-blue-600 hover:text-blue-800 transition-colors">
            <Edit2 size={18} />
          </button>
          <button onClick={() => handleDelete(row._id)} className="text-red-600 hover:text-red-800 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Subject Management</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading subjects...</div>
        ) : (
          <Table columns={columns} data={subjects} keyExtractor={(row) => row._id} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={currentSubject.name}
              onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={currentSubject.code}
              onChange={(e) => setCurrentSubject({ ...currentSubject, code: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="3"
              value={currentSubject.description || ''}
              onChange={(e) => setCurrentSubject({ ...currentSubject, description: e.target.value })}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subjects;
