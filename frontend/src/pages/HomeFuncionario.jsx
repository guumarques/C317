import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  History,
  MessageSquare,
  Lightbulb,
  Trophy,
  Calendar,
} from "lucide-react";
import GraficoFuncionario from "../components/GraficoFuncionario";

const NAV = [
  {
    icon: <ClipboardList size={15} />,
    label: "Questionário",
    path: "/questionario",
  },
  { icon: <History size={15} />, label: "Histórico", path: "/historico" },
  {
    icon: <MessageSquare size={15} />,
    label: "Chat com psicólogo",
    path: "/chat",
  },
  { icon: <Lightbulb size={15} />, label: "Insights", path: "/insights" },
  { icon: <Calendar size={15} />, label: "Consultas", path: "/consultas" },
];

const METRICS = [
  { label: "Estresse", key: "stress_score" },
  { label: "Ansiedade", key: "anxiety_score" },
  { label: "Burnout", key: "burnout_score" },
  { label: "Depressão", key: "depression_score" },
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

export default function HomeFuncionario() {
  const [user, setUser] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(stored));
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:8000/api/questionnaires/latest/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setQuestionnaire(d);
      })
      .catch(() => {});
    fetch("http://localhost:8000/api/gamification/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setGamification(d);
          setTotalPoints(d.total_points ?? 0);
        }
      })
      .catch(() => {});
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  }

  if (!user) return null;

  const firstName = user.first_name || user.username || "Usuário";
  const streak = gamification?.login_streak ?? 0;
  const maxPoints = 1500;
  const progress = Math.min((totalPoints / maxPoints) * 100, 100);
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3 flex-shrink-0">
        <span className="text-white font-medium text-sm flex-1">
          MentisTech
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full">
            Funcionário
          </span>
          <span className="text-white text-xs">
            {user.first_name} {user.last_name}
          </span>
          <button
            onClick={handleLogout}
            className="text-[11px] border border-white/30 text-white px-2.5 py-1 rounded-md hover:bg-white/10 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-44 bg-white border-r border-gray-100 flex-shrink-0 p-2 flex flex-col gap-0.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2 pt-2 pb-1 font-medium">
            Menu
          </p>
          {NAV.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs w-full text-left text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-lg font-semibold text-gray-900 mb-0.5">
            Olá, {firstName}
          </h1>
          <p className="text-xs text-gray-400 mb-5 capitalize">{today}</p>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {METRICS.map((m) => {
              const val = questionnaire?.[m.key];
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
            <div className="mt-4">
              <GraficoFuncionario />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-800 mb-3">
                Ações rápidas
              </p>
              {[
                {
                  icon: <ClipboardList size={16} />,
                  title: "Questionário semanal",
                  sub: "Disponível agora",
                  path: "/questionario",
                },
                {
                  icon: <MessageSquare size={16} />,
                  title: "Chat com psicólogo",
                  sub: "Converse diretamente com seu psicólogo",
                  path: "/chat",
                },
                {
                  icon: <Lightbulb size={16} />,
                  title: "Meus insights",
                  sub: "Ver recomendações",
                  path: "/insights",
                },
                {
                  icon: <Calendar size={16} />,
                  title: "Minhas consultas",
                  sub: "Ver agendamentos com o psicólogo",
                  path: "/consultas",
                },
              ].map((a, i) => (
                <div
                  key={i}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-100 hover:border-green-500 rounded-xl mb-2 last:mb-0 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700 flex-shrink-0">
                    {a.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-800">
                      {a.title}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {a.sub}
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 mb-3">
                  Minha pontuação
                </p>
                <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 mb-3">
                  <Trophy size={28} className="text-green-700 flex-shrink-0" />
                  <div>
                    <div className="text-2xl font-medium text-green-700 leading-none">
                      {totalPoints}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      pontos totais · {streak} dias consecutivos
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>Próximo nível</span>
                  <span>
                    {totalPoints.toLocaleString("pt-BR")} /{" "}
                    {maxPoints.toLocaleString("pt-BR")} pts
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-[11px] text-gray-400 mt-1.5">
                  faltam {(maxPoints - totalPoints).toLocaleString("pt-BR")} pts
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 mb-3">
                  Histórico de pontos
                </p>
                {(gamification?.events ?? []).slice(0, 4).map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none"
                  >
                    <span className="text-xs text-gray-700">
                      {e.event_type === "daily_login"
                        ? "Login diário"
                        : "Questionário respondido"}
                    </span>
                    <span className="text-xs font-medium text-green-700">
                      +{e.points} pts
                    </span>
                  </div>
                ))}
                {(gamification?.events ?? []).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    Nenhum ponto ainda.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
