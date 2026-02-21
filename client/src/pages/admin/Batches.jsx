import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState({ name: '', description: '', subjects: [] });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, subjectsRes] = await Promise.all([
        api.get('/batches'),
        api.get('/subjects')
      ]);
      setBatches(batchesRes.data);
      setAllSubjects(subjectsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (batch = null) => {
    if (batch) {
      setCurrentBatch({
        ...batch,
        subjects: batch.subjects.map(s => s._id)
      });
      setIsEditing(true);
    } else {
      setCurrentBatch({ name: '', description: '', subjects: [] });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBatch({ name: '', description: '', subjects: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/batches/${currentBatch._id}`, currentBatch);
        toast.success('Batch updated successfully');
      } else {
        await api.post('/batches', currentBatch);
        toast.success('Batch created successfully');
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this batch?')) {
      try {
        await api.delete(`/batches/${id}`);
        toast.success('Batch deactivated successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to deactivate batch');
      }
    }
  };

  const handleSubjectToggle = (subjectId) => {
    const updatedSubjects = currentBatch.subjects.includes(subjectId)
      ? currentBatch.subjects.filter(id => id !== subjectId)
      : [...currentBatch.subjects, subjectId];
    
    setCurrentBatch({ ...currentBatch, subjects: updatedSubjects });
  };

  const columns = [
    { header: 'Batch Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Assigned Subjects', 
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.subjects.length > 0 ? (
            row.subjects.map(s => (
              <span key={s._id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {s.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">No subjects assigned</span>
          )}
        </div>
      )
    },
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
        <h2 className="text-2xl font-bold text-gray-800">Batch Management</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Add Batch</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading batches...</div>
        ) : (
          <Table columns={columns} data={batches} keyExtractor={(row) => row._id} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? 'Edit Batch' : 'Add New Batch'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={currentBatch.name}
              onChange={(e) => setCurrentBatch({ ...currentBatch, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="2"
              value={currentBatch.description || ''}
              onChange={(e) => setCurrentBatch({ ...currentBatch, description: e.target.value })}
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Subjects</label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
              {allSubjects.map(subject => (
                <label key={subject._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={currentBatch.subjects.includes(subject._id)}
                    onChange={() => handleSubjectToggle(subject._id)}
                  />
                  <span className="text-sm text-gray-700">{subject.name} ({subject.code})</span>
                </label>
              ))}
              {allSubjects.length === 0 && (
                <p className="text-sm text-gray-500 p-2">No subjects available. Please create subjects first.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
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
              {isEditing ? 'Save Changes' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Batches;
