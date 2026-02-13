import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import BranchSelection from './pages/BranchSelection';
import AdminDashboard from './pages/AdminDashboard';
import BookingForm from './components/BookingForm';
import { LogOut, User, LayoutDashboard, Send } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className={`w-64 bg-[#0a192f] text-white flex-shrink-0 flex flex-col transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 h-full`}>
        <div className="p-6 flex flex-col items-center border-b border-gray-800">
          <div className="bg-white p-2 rounded-lg mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="DTDC+" className="h-10 w-auto object-contain" />
          </div>
          <div className="text-xs tracking-widest text-gray-400 uppercase">Enterprise Portal</div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {user.role === 'admin' && (
            <a
              href="/admin"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${location.pathname === '/admin' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <LayoutDashboard size={20} className={location.pathname === '/admin' ? 'text-white' : 'text-gray-400 group-hover:text-red-400'} />
              <span className="font-medium">Dashboard</span>
            </a>
          )}

          {user.role !== 'admin' && (
            <a
              href="/booking"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${location.pathname === '/booking' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <Send size={20} className={location.pathname === '/booking' ? 'text-white' : 'text-gray-400 group-hover:text-red-400'} />
              <span className="font-medium">New Booking</span>
            </a>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-[#061224]">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="bg-red-600/20 p-2 rounded-full border border-red-500/30">
              <User size={16} className="text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">{user.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-transparent hover:bg-red-600 border border-gray-700 hover:border-red-600 text-gray-300 hover:text-white py-2 rounded-lg text-sm transition-all duration-300"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-100 relative">
        <header className="bg-white shadow-md p-4 flex justify-between items-center md:hidden sticky top-0 z-10">
          <img src="/src/assets/logo.png" alt="DTDC" className="h-8" />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#0a192f]">
            <span className="sr-only">Menu</span>
            <div className="space-y-1">
              <div className="w-6 h-0.5 bg-current"></div>
              <div className="w-6 h-0.5 bg-current"></div>
              <div className="w-6 h-0.5 bg-current"></div>
            </div>
          </button>
        </header>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};


const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    console.log("[ProtectedRoute] Loading...");
    return <div>Loading...</div>;
  }
  if (!user) {
    console.log("[ProtectedRoute] No user, redirecting to login");
    return <Navigate to="/login" />;
  }
  if (role && user.role !== role) {
    console.log("[ProtectedRoute] Role mismatch, redirecting to /");
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

const BookingRedirect = () => {
  const { user } = useAuth();
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <BookingForm />;
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<BranchSelection />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingRedirect />
              </ProtectedRoute>
            }
          />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
