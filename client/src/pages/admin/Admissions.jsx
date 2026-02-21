import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Check, X } from 'lucide-react';
import api from '../../services/api';
import Table from '../../components/common/Table';

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const response = await api.get('/admissions');
      setAdmissions(response.data);
    } catch (error) {
      toast.error('Failed to load pending admissions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/admissions/${id}/${action}`);
      toast.success(`Admission ${action}ed successfully`);
      fetchAdmissions();
    } catch (error) {
      toast.error(`Failed to ${action} admission`);
    }
  };

  const columns = [
    { header: 'Student Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Applied Batch', 
      render: (row) => (
        <span className="font-medium text-gray-700">
          {row.appliedForBatch?.name || 'Unknown Batch'}
        </span>
      ) 
    },
    { 
      header: 'Date Applied', 
      render: (row) => new Date(row.createdAt).toLocaleDateString() 
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-3">
          <button 
            onClick={() => handleAction(row._id, 'approve')} 
            className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-full text-sm font-medium transition-colors"
          >
            <Check size={16} />
            <span>Approve</span>
          </button>
          <button 
            onClick={() => handleAction(row._id, 'reject')} 
            className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-sm font-medium transition-colors"
          >
            <X size={16} />
            <span>Reject</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pending Admissions</h2>
        <p className="text-gray-600 mt-1">Review and approve new student applications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading pending admissions...</div>
        ) : (
          <Table columns={columns} data={admissions} keyExtractor={(row) => row._id} />
        )}
      </div>
    </div>
  );
};

export default Admissions;
