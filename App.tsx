import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { DrugRequestForm } from './pages/DrugRequestForm';
import { ConsultationForm } from './pages/ConsultationForm';
import { Login } from './pages/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Legal } from './pages/Legal';
import { NotFound } from './pages/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/request-drug" element={<DrugRequestForm />} />
                  <Route path="/book-consult" element={<ConsultationForm />} />
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/legal/terms" element={<Legal />} />
                  <Route path="/legal/privacy" element={<Legal />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;