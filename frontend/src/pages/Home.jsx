import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NAV = [
  { icon: "🏠", label: "Início" },
  { icon: "📝", label: "Questionário" },
  { icon: "💬", label: "Chat de apoio" },
  { icon: "💡", label: "Insights" },
  { icon: "🏆", label: "Pontuação" },
];

const POINTS_HISTORY = [
  { action: "Questionário respondido", pts: "+50 pts" },
  { action: "Login consecutivo",       pts: "+20 pts" },
  { action: "Sessão de chat",          pts: "+10 pts" },
  { action: "Insight visualizado",     pts: "+5 pts"  },
];

const METRICS = [
  { label: "Estresse",  key: "stress_score",     color: "#EF9F27", badge: "warn" },
  { label: "Ansiedade", key: "anxiety_score",     color: "#1D9E75", badge: "ok"   },
  { label: "Burnout",   key: "burnout_score",     color: "#1D9E75", badge: "ok"   },
  { label: "Depressão", key: "depression_score",  color: "#1D9E75", badge: "ok"   },
];

function badgeClass(type) {
  return type === "warn"
    ? "bg-amber-100 text-amber-800 text-[10px] font-medium px-2 py-0.5 rounded-full"
    : "bg-green-100 text-green-800 text-[10px] font-medium px-2 py-0.5 rounded-full";
}

function badgeLabel(val) {
  if (val === undefined || val === null) return "—";
  if (val >= 70) return "Alto";
  if (val >= 40) return "Moderado";
  return "Baixo";
}

function badgeType(val) {
  if (val === undefined || val === null) return "ok";
  return val >= 40 ? "warn" : "ok";
}

export default function Home() {
  const [user, setUser]         = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [activeNav, setActiveNav] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);

    // Busca último questionário do usuário
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/api/questionnaires/latest/", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data) setQuestionnaire(data); })
        .catch(() => {});
    }
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  }

  if (!user) return null;

  const firstName = user.first_name || user.username || "Usuário";
  const streak    = user.login_streak   ?? 0;
  const points    = user.total_points   ?? 0;
  const maxPoints = 1500;
  const progress  = Math.min((points / maxPoints) * 100, 100);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Topbar */}
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3 flex-shrink-0">
        <span className="text-white font-medium text-sm flex-1">🧠 MentisTech</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full">
            {user.role === "employee"     ? "Funcionário"
           : user.role === "psychologist" ? "Psicólogo"
           : user.role === "manager"      ? "Gestor"
           : "Usuário"}
          </span>
          <span className="text-white text-xs">{user.first_name} {user.last_name}</span>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-[11px] font-medium">
            {(user.first_name?.[0] ?? "")}{(user.last_name?.[0] ?? "")}
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] border border-white/30 text-white px-2.5 py-1 rounded-md hover:bg-white/10 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <div className="w-44 bg-white border-r border-gray-100 flex-shrink-0 p-2 flex flex-col gap-0.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2 pt-2 pb-1 font-medium">Menu</p>
          {NAV.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveNav(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs w-full text-left transition-colors ${
                activeNav === i
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto p-6">

          <h1 className="text-lg font-semibold text-gray-900 mb-0.5">
            Olá, {firstName} 👋
          </h1>
          <p className="text-xs text-gray-400 mb-5 capitalize">{today}</p>

          {/* Métricas */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {METRICS.map((m) => {
              const val  = questionnaire?.[m.key];
              const type = badgeType(val);
              return (
                <div key={m.label} className="bg-gray-50 rounded-xl p-4">
                  <div
                    className="text-2xl font-medium mb-1"
                    style={{ color: type === "warn" ? "#EF9F27" : "#1D9E75" }}
                  >
                    {val ?? "—"}
                  </div>
                  <div className="text-xs text-gray-400">{m.label}</div>
                  <div className="mt-2">
                    <span className={badgeClass(type)}>{badgeLabel(val)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Ações rápidas */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-800 mb-3">Ações rápidas</p>
              {[
                { icon: "📝", title: "Questionário semanal",   sub: "Disponível agora" },
                { icon: "💬", title: "Chat de acolhimento",     sub: "Apoio emocional com IA" },
                { icon: "💡", title: "Novo insight disponível", sub: "Validado pelo psicólogo" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-100 hover:border-green-500 rounded-xl mb-2 last:mb-0 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-base flex-shrink-0">
                    {a.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-800">{a.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{a.sub}</div>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">

              {/* Streak */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 mb-3">Sequência de acessos</p>
                <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 mb-3">
                  <span className="text-3xl font-medium text-green-700 leading-none">{streak}</span>
                  <div>
                    <div className="text-xs font-medium text-gray-800">dias consecutivos 🔥</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">Continue para desbloquear "Constância"</div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>Próximo nível</span>
                  <span>{points.toLocaleString("pt-BR")} / {maxPoints.toLocaleString("pt-BR")} pts</span>
                </div>
                <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-[11px] text-gray-400 mt-1.5">
                  Nível 4 — Explorador · faltam {(maxPoints - points).toLocaleString("pt-BR")} pts
                </div>
              </div>

              {/* Histórico de pontos */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 mb-3">Histórico de pontos</p>
                {POINTS_HISTORY.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none"
                  >
                    <span className="text-xs text-gray-700">{p.action}</span>
                    <span className="text-xs font-medium text-green-700">{p.pts}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
