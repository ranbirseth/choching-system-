import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import ApplyAdmission from './pages/ApplyAdmission';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/admin/Subjects';
import Batches from './pages/admin/Batches';
import Admissions from './pages/admin/Admissions';
import AttendanceReview from './pages/admin/AttendanceReview';
import MyAttendance from './pages/student/MyAttendance';
import Assignments from './pages/admin/Assignments';
import SubmissionsReview from './pages/admin/SubmissionsReview';
import MyAssignments from './pages/student/MyAssignments';
import AdminTimetable from './pages/admin/AdminTimetable';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentGrades from './pages/student/StudentGrades';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<ApplyAdmission />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="batches" element={<Batches />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="attendance-review" element={<AttendanceReview />} />
            <Route path="my-attendance" element={<MyAttendance />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:id/submissions" element={<SubmissionsReview />} />
            <Route path="my-assignments" element={<MyAssignments />} />
            <Route path="timetables" element={<AdminTimetable />} />
            <Route path="my-timetable" element={<StudentTimetable />} />
            <Route path="grades" element={<StudentGrades />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
