import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login                  from "./pages/Login";
import Register               from "./pages/Register";
import Lgpd                   from "./pages/Lgpd";
import HomeFuncionario        from "./pages/HomeFuncionario";
import HomePsicologo          from "./pages/HomePsicologo";
import HomeGestor             from "./pages/HomeGestor";
import Questionario           from "./pages/Questionario";
import Insights               from "./pages/Insights";
import Chat                   from "./pages/Chat";
import Historico              from "./pages/Historico";
import Dashboard              from "./pages/Dashboard";
import Alertas                from "./pages/Alertas";
import PsicologoInsights      from "./pages/PsicologoInsights";
import PsicologoQuestionarios from "./pages/PsicologoQuestionarios";
import PsicologoChats         from "./pages/PsicologoChats";

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  if (roles) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  }
  return children;
}

function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role === "psychologist")                     return <Navigate to="/home/psicologo"   replace />;
  if (user.role === "manager" || user.role === "admin") return <Navigate to="/home/gestor"      replace />;
  return                                                       <Navigate to="/home/funcionario" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lgpd"     element={<Lgpd />} />

        <Route path="/home" element={<PrivateRoute><HomeRedirect /></PrivateRoute>} />

        {/* FUNCIONÁRIO */}
        <Route path="/home/funcionario" element={<PrivateRoute roles={["employee"]}><HomeFuncionario /></PrivateRoute>} />
        <Route path="/questionario"     element={<PrivateRoute roles={["employee"]}><Questionario /></PrivateRoute>} />
        <Route path="/insights"         element={<PrivateRoute roles={["employee"]}><Insights /></PrivateRoute>} />
        <Route path="/historico"        element={<PrivateRoute roles={["employee"]}><Historico /></PrivateRoute>} />
        <Route path="/chat"             element={<PrivateRoute roles={["employee"]}><Chat /></PrivateRoute>} />

        {/* PSICÓLOGO */}
        <Route path="/home/psicologo"          element={<PrivateRoute roles={["psychologist"]}><HomePsicologo /></PrivateRoute>} />
        <Route path="/psicologo/insights"      element={<PrivateRoute roles={["psychologist"]}><PsicologoInsights /></PrivateRoute>} />
        <Route path="/psicologo/questionarios" element={<PrivateRoute roles={["psychologist"]}><PsicologoQuestionarios /></PrivateRoute>} />
        <Route path="/psicologo/chats"         element={<PrivateRoute roles={["psychologist"]}><PsicologoChats /></PrivateRoute>} />

        {/* GESTOR */}
        <Route path="/home/gestor" element={<PrivateRoute roles={["manager", "admin"]}><HomeGestor /></PrivateRoute>} />
        <Route path="/dashboard"   element={<PrivateRoute roles={["manager", "admin"]}><Dashboard /></PrivateRoute>} />
        <Route path="/alertas"     element={<PrivateRoute roles={["manager", "admin"]}><Alertas /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
