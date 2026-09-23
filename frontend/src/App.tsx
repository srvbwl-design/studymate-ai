import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

import { DashboardLayout } from './layouts/DashboardLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TutorPage } from './pages/TutorPage';
import { ExplainPage } from './pages/ExplainPage';
import { NotesPage } from './pages/NotesPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { StudyPlansPage } from './pages/StudyPlansPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated Dashboard Shell */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tutor" element={<TutorPage />} />
                <Route path="/explain" element={<ExplainPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/quizzes" element={<QuizzesPage />} />
                <Route path="/study-plans" element={<StudyPlansPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
