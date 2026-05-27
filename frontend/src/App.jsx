import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login        from "./pages/Login";
import Lgpd         from "./pages/Lgpd";
import Home         from "./pages/Home";
import Questionario from "./pages/Questionario";
import Insights     from "./pages/Insights";
import Chat         from "./pages/Chat";
import Dashboard    from "./pages/Dashboard";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"    element={<Login />} />
        <Route path="/lgpd" element={<Lgpd />} />

        <Route path="/home" element={
          <PrivateRoute><Home /></PrivateRoute>
        } />
        <Route path="/questionario" element={
          <PrivateRoute><Questionario /></PrivateRoute>
        } />
        <Route path="/insights" element={
          <PrivateRoute><Insights /></PrivateRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute><Chat /></PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
