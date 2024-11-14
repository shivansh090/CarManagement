import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import CarList from './components/CarList';
import CarDetail from './components/CarDetail';
import CarForm from './components/CarForm';
import ApiDocs from './components/ApiDocs';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const setAuthToken = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute token={token}>
              <CarList token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute token={token}>
              <CarDetail token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute token={token}>
              <CarForm token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute token={token}>
              <CarForm token={token} />
            </ProtectedRoute>
          }
        />
        <Route path="/api/docs" element={<ApiDocs />} />
      </Routes>
    </Router>
  );
}

function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default App;