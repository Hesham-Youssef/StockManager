import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import StockExchangeList from "./page/StockExchangeList";
import StockList from "./page/StockList";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import Navbar from "./components/Navbar";
import PrivateRoute from "./route/PrivateRoute";
import PublicRoute from "./route/PublicRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />

          <div className="container mt-5 pt-4">
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />

              {/* Protected routes */}
              <Route
                path="/exchanges"
                element={
                  <PrivateRoute>
                    <StockExchangeList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/stocks"
                element={
                  <PrivateRoute>
                    <StockList />
                  </PrivateRoute>
                }
              />

              {/* Default */}
              <Route path="/" element={<Navigate to="/exchanges" />} />
            </Routes>
          </div>

          <ToastContainer position="top-right" autoClose={4000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
