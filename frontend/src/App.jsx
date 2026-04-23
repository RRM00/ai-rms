import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { POS } from './pages/POS';
import { Kitchen } from './pages/Kitchen';
import { Admin } from './pages/Admin';
import { Feedback } from './pages/Feedback';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/" element={<POS />} /> {/* POS is public for this Phase, or can be protected if we want. We'll leave it public so staff can just use it, but wait, usually POS should be logged in staff. Let's make it protected, but accessible by staff. Actually, the user's plan said Kitchen and Admin views are protected. I'll make POS public for now if we want, or protected. Let's make all except Login and Feedback protected by default. */}

          {/* Protected Routes (Staff or Admin) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<POS />} />
            <Route path="/kitchen" element={<Kitchen />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
