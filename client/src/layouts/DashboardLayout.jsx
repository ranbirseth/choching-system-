import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Users, BookOpen, Calendar, CheckSquare, Award } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const role = user?.role;
    const baseItems = [{ name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' }];

    if (role === 'Admin' || role === 'Teacher') {
      return [
        ...baseItems,
        { name: 'Batches', icon: <Users size={20} />, path: '/batches' },
        { name: 'Subjects', icon: <BookOpen size={20} />, path: '/subjects' },
        { name: 'Admissions', icon: <CheckSquare size={20} />, path: '/admissions' },
        { name: 'Attendance', icon: <CheckSquare size={20} />, path: '/attendance-review' },
        { name: 'Assignments', icon: <Award size={20} />, path: '/assignments' },
        { name: 'Timetables', icon: <Calendar size={20} />, path: '/timetables' },
      ];
    }

    if (role === 'Student') {
      return [
        ...baseItems,
        { name: 'My Attendance', icon: <CheckSquare size={20} />, path: '/my-attendance' },
        { name: 'My Assignments', icon: <Award size={20} />, path: '/my-assignments' },
        { name: 'Timetable', icon: <Calendar size={20} />, path: '/my-timetable' },
        { name: 'Grades', icon: <Award size={20} />, path: '/grades' },
      ];
    }
    
    return baseItems;
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-center">
          <h1 className="text-xl font-bold text-blue-600">Coaching Hub</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {getMenuItems().map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Welcome, {user?.name}</h2>
          <div className="flex items-center space-x-4">
             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
               {user?.role}
             </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
