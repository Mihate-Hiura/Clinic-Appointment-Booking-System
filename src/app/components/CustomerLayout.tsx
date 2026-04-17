import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Calendar, LogOut } from 'lucide-react';

export function CustomerLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold">HealthCare Clinic</span>
            </div>
            <nav className="flex gap-6">
              <NavLink
                to="/dashboard/book"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-blue-600' : 'text-neutral-600 hover:text-neutral-900'
                  }`
                }
              >
                Book Appointment
              </NavLink>
              <NavLink
                to="/dashboard/history"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-blue-600' : 'text-neutral-600 hover:text-neutral-900'
                  }`
                }
              >
                Booking History
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-neutral-600">Customer</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Outlet />
      </main>
    </div>
  );
}
