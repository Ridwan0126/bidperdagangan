"use client";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedLayout from "./components/ProtectedLayout";
import Login from "./pages/Login";
import DataPedagang from "./pages/DataPedagang";
import DataPerpasar from "./pages/DataPerpasar";
import UserManagement from "./pages/UserManagement";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/data-perpasar" replace />} />
            <Route path="data-pedagang" element={<DataPedagang />} />
            <Route path="data-perpasar" element={<DataPerpasar />} />
            <Route path="user-management" element={<UserManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
