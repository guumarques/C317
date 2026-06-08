import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
  { value: "employee",    label: "Funcionário" },
  { value: "psychologist", label: "Psicólogo" },
  { value: "manager",     label: "Gestor" },
];

const EMPTY = {
  username:         "",
  first_name:       "",
  last_name:        "",
  email:            "",
  company:          "",
  password:         "",
  password_confirm: "",
  role:             "employee",
  lgpd_consent:     false,
};

export default function Register() {
  const [form, setForm]     = useState(EMPTY);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm(f => ({
      ...f,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!form.lgpd_consent) {
      setError("Você precisa aceitar os termos de privacidade.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/users/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // Pega o primeiro erro retornado pelo DRF
        const firstKey = Object.keys(data)[0];
        const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
        setError(msg || "Erro ao criar conta.");
        return;
      }

      // Registro OK — redireciona para login com mensagem
      navigate("/", { state: { success: "Conta criada! Faça login." } });
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl mb-3">
            🧠
          </div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">MentisTech</h1>
          <p className="text-xs text-gray-400 mt-1">Criar nova conta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Nome e sobrenome */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Nome</label>
              <input
                type="text" placeholder="Lucas" value={form.first_name}
                onChange={set("first_name")} required
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Sobrenome</label>
              <input
                type="text" placeholder="Ferreira" value={form.last_name}
                onChange={set("last_name")} required
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600 transition-colors"
              />
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Usuário</label>
            <input
              type="text" placeholder="lucas.ferreira" value={form.username}
              onChange={set("username")} required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">E-mail</label>
            <input
              type="email" placeholder="lucas@empresa.com" value={form.email}
              onChange={set("email")} required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>

          {/* Company UUID */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">ID da empresa</label>
            <input
              type="text" placeholder="UUID da empresa" value={form.company}
              onChange={set("company")} required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-green-600 transition-colors"
            />
            <p className="text-[11px] text-gray-400">Solicite ao administrador da sua empresa.</p>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Perfil</label>
            <select
              value={form.role} onChange={set("role")} required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-green-600 transition-colors bg-white"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Senha</label>
            <input
              type="password" placeholder="••••••••" value={form.password}
              onChange={set("password")} required minLength={6}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>

          {/* Confirmar senha */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Confirmar senha</label>
            <input
              type="password" placeholder="••••••••" value={form.password_confirm}
              onChange={set("password_confirm")} required minLength={6}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>

          {/* LGPD */}
          <label className="flex items-start gap-2 cursor-pointer mt-1">
            <input
              type="checkbox" checked={form.lgpd_consent}
              onChange={set("lgpd_consent")}
              className="mt-0.5 accent-green-600"
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              Li e aceito os{" "}
              <span onClick={() => navigate("/lgpd")}
                className="text-green-700 underline cursor-pointer hover:text-green-800">
                termos de privacidade e política LGPD
              </span>
              .
            </span>
          </label>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 active:scale-[.98] text-white text-sm font-medium py-2.5 rounded-lg transition-all mt-1"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Já tem conta?{" "}
          <span onClick={() => navigate("/")}
            className="text-green-700 cursor-pointer hover:underline">
            Fazer login
          </span>
        </p>
      </div>
    </div>
  );
}