import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  if (!user) return null;

  const firstName = user.full_name?.split(" ")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-green-700 px-6 h-12 flex items-center justify-between">
        <span className="text-white font-semibold text-sm tracking-tight">
          🧠 MentisTech
        </span>
        <div className="flex items-center gap-3">
          <span className="text-white text-xs opacity-80">{user.full_name}</span>
          <button
            onClick={handleLogout}
            className="text-xs border border-white/30 text-white px-3 py-1 rounded-md hover:bg-white/10 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Olá, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Bem-vindo de volta à sua plataforma de bem-estar.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-3xl font-semibold text-green-700">
              {user.login_streak ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {user.login_streak === 1 ? "dia seguido" : "dias seguidos"}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-3xl mb-1">⭐</div>
            <div className="text-3xl font-semibold text-gray-800">
              {user.total_points ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">pontos totais</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            O que você quer fazer?
          </h2>
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-green-50 hover:border-green-200 border border-gray-100 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">📝</span>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-800">
                    Responder questionário
                  </div>
                  <div className="text-xs text-gray-400">
                    Disponível esta semana
                  </div>
                </div>
              </div>
              <span className="text-gray-300 text-sm">→</span>
            </button>

            <button className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-green-50 hover:border-green-200 border border-gray-100 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">💬</span>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-800">
                    Chat de acolhimento
                  </div>
                  <div className="text-xs text-gray-400">
                    Apoio emocional com IA
                  </div>
                </div>
              </div>
              <span className="text-gray-300 text-sm">→</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
