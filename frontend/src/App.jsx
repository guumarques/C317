import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Lgpd  from "./pages/Lgpd";
import Home  from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"     element={<Login />} />
        <Route path="/lgpd" element={<Lgpd />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
