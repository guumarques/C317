import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePsicologo() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/"); return; }
    setUser(JSON.parse(stored));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3 flex-shrink-0">
        <span className="text-white font-medium text-sm flex-1">🧠 MentisTech</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full">Psicólogo</span>
          <span className="text-white text-xs">{user.first_name} {user.last_name}</span>
          <button onClick={handleLogout} className="text-[11px] border border-white/30 text-white px-2.5 py-1 rounded-md hover:bg-white/10 transition-colors">Sair</button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-44 bg-white border-r border-gray-100 flex-shrink-0 p-2 flex flex-col gap-0.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2 pt-2 pb-1 font-medium">Menu</p>
          {[
            { icon: "🏠", label: "Início",         path: "/home/psicologo" },
            { icon: "📋", label: "Questionários",  path: "/psicologo/questionarios" },
            { icon: "💡", label: "Insights",        path: "/psicologo/insights" },
            { icon: "💬", label: "Chat de apoio",  path: "/chat" },
          ].map((item, i) => (
            <button key={i} onClick={() => navigate(item.path)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs w-full text-left text-gray-600 hover:bg-gray-50 transition-colors">
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Olá, {user.first_name} 👋</h1>
          <p className="text-xs text-gray-400 mb-6">Painel do psicólogo</p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "📋", title: "Questionários dos funcionários", sub: "Ver todos os questionários respondidos", path: "/psicologo/questionarios" },
              { icon: "💡", title: "Gerenciar insights",             sub: "Criar e validar insights",               path: "/psicologo/insights" },
              { icon: "💬", title: "Chat de apoio",                  sub: "Usar a IA como ferramenta de apoio",     path: "/chat" },
            ].map((card, i) => (
              <div key={i} onClick={() => navigate(card.path)}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm cursor-pointer hover:border-green-500 transition-colors">
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="text-sm font-semibold text-gray-800">{card.title}</div>
                <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}