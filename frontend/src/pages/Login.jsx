import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      setError("Preencha usuário e senha.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Faz login e pega os tokens
      const res = await fetch("http://localhost:8000/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Usuário ou senha inválidos.");
        return;
      }

      const { access, refresh } = await res.json();
      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);

      // 2. Busca os dados do usuário
      const meRes = await fetch("http://localhost:8000/api/users/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const user = await meRes.json();
      localStorage.setItem("user", JSON.stringify(user));

      // 3. Redireciona conforme lgpd_consent
      if (!user.lgpd_consent) {
        navigate("/lgpd");
      } else {
        navigate("/home");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl mb-3">
            🧠
          </div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            MentisTech
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Plataforma de saúde mental corporativa
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Usuário</label>
            <input
              type="text"
              placeholder="seu.usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 active:scale-[.98] text-white text-sm font-medium py-2.5 rounded-lg transition-all"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 hover:text-green-700 cursor-pointer transition-colors">
          Esqueci minha senha
        </p>
      </div>
    </div>
  );
}
