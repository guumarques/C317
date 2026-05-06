import { useState } from "react";

const ROLES = [
  { key: "funcionario", label: "Funcionário", icon: "👤" },
  { key: "psicologo",   label: "Psicólogo",   icon: "🩺" },
  { key: "gestor",      label: "Gestor",       icon: "📊" },
];

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  function handleSubmit(role) {
    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setError("");
    // Chama o callback com o perfil escolhido
    // Substitua por sua lógica de autenticação real (fetch para o backend)
    onLogin?.({ email, role });
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

        {/* Campos */}
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">E-mail corporativo</label>
            <input
              type="email"
              placeholder="seu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
        </div>

        {/* Erro */}
        {error && (
          <p className="text-xs text-red-500 mb-4">{error}</p>
        )}

        {/* Botão principal */}
        <button
          onClick={() => handleSubmit("funcionario")}
          className="w-full bg-green-700 hover:bg-green-800 active:scale-[.98] text-white text-sm font-medium py-2.5 rounded-lg transition-all mb-4"
        >
          Entrar
        </button>

        {/* Divisor */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">ou entrar como</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Botões de perfil */}
        <div className="flex gap-2 mb-5">
          {ROLES.map((r) => (
            <button
              key={r.key}
              onClick={() => handleSubmit(r.key)}
              className="flex-1 flex flex-col items-center gap-1 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:border-green-600 hover:text-green-700 active:scale-[.97] transition-all"
            >
              <span className="text-base">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>

        {/* Esqueci senha */}
        <p className="text-center text-xs text-gray-400 hover:text-green-700 cursor-pointer transition-colors">
          Esqueci minha senha
        </p>
      </div>
    </div>
  );
}
