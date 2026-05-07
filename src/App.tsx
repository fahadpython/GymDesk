import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { MembersList } from './pages/MembersList';
import { AddMember } from './pages/AddMember';
import { MemberDetails } from './pages/MemberDetails';
import { ImportMembers } from './pages/ImportMembers';
import { Fees } from './pages/Fees';
import { Reports } from './pages/Reports';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center p-8 text-xl font-medium text-gray-500">Loading GymDesk...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
          <Route path="/members/new" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />
          <Route path="/members/import" element={<ProtectedRoute><ImportMembers /></ProtectedRoute>} />
          <Route path="/members/:id" element={<ProtectedRoute><MemberDetails /></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
