import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const METRICS = [
  { label: "Estresse",  key: "stress_score" },
  { label: "Ansiedade", key: "anxiety_score" },
  { label: "Burnout",   key: "burnout_score" },
  { label: "Depressão", key: "depression_score" },
];

function scoreBadge(val) {
  if (val == null) return null;
  const color = val >= 70 ? "bg-red-100 text-red-700" : val >= 40 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
  const label = val >= 70 ? "Alto" : val >= 40 ? "Moderado" : "Baixo";
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${color}`}>{label} ({val})</span>;
}

function DeltaBadge({ atual, anterior }) {
  if (atual == null || anterior == null) return <span className="text-gray-300 text-[11px]">—</span>;
  const diff = Math.round(atual - anterior);
  if (diff === 0) return <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">=</span>;
  const better = diff < 0;
  return (
    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${better ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      {diff > 0 ? `+${diff}` : diff} {better ? "↓" : "↑"}
    </span>
  );
}

export default function PsicologoQuestionarios() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [expanded, setExpanded]             = useState(null); // funcionário expandido
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/api/questionnaires/all/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao carregar"))
      .then(data => {
        // Agrupa por funcionário
        const grouped = {};
        data.forEach(q => {
          const uid      = q.user?.id ?? q.user;
          const username = q.user?.username ?? q.user;
          const name     = q.user?.first_name
            ? `${q.user.first_name} ${q.user.last_name ?? ""}`.trim()
            : username;
          if (!grouped[uid]) grouped[uid] = { uid, name, items: [] };
          grouped[uid].items.push(q);
        });
        // Garante ordem cronológica dentro de cada funcionário (mais recente primeiro)
        Object.values(grouped).forEach(g => g.items.sort((a, b) => new Date(b.answered_at) - new Date(a.answered_at)));
        setQuestionnaires(Object.values(grouped));
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button onClick={() => navigate("/home/psicologo")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">Questionários dos funcionários</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Questionários dos funcionários</h1>
        <p className="text-xs text-gray-400 mb-6">Questionários respondidos por funcionário · clique para expandir</p>

        {loading && <div className="text-sm text-gray-400 text-center py-12">Carregando...</div>}
        {error   && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>}
        {!loading && !error && questionnaires.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-12">Nenhum questionário encontrado.</div>
        )}

        {questionnaires.map(({ uid, name, items }) => {
          const isOpen  = expanded === uid;
          const latest  = items[0];
          const previous = items[1] ?? null;

          return (
            <div key={uid} className="bg-white border border-gray-100 rounded-xl mb-3 shadow-sm overflow-hidden">

              {/* Cabeçalho do funcionário */}
              <button
                onClick={() => setExpanded(isOpen ? null : uid)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">{name}</div>
                    <div className="text-[11px] text-gray-400">{items.length} questionário{items.length !== 1 ? "s" : ""} respondido{items.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-400">
                    Último: {new Date(latest.answered_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                  <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Conteúdo expandido */}
              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4">

                  {/* Verificação de melhora — compara último com anterior */}
                  {previous && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-3">
                        Último questionário
                        <span className="text-gray-400 font-normal ml-1">
                          (Comparação com o questionário anterior)
                        </span>
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {METRICS.map(m => (
                          <div key={m.key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                            <span className="text-xs text-gray-600">{m.label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-500">{latest[m.key] ?? "—"}</span>
                              <DeltaBadge atual={latest[m.key]} anterior={previous[m.key]} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lista de todos os questionários */}
                  <p className="text-xs font-medium text-gray-700 mb-2">Todos os registros</p>
                  {items.map((q, idx) => (
                    <div key={q.id} className="border border-gray-100 rounded-xl p-4 mb-2 last:mb-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-400">
                          {new Date(q.answered_at).toLocaleDateString("pt-BR", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Mais recente</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {METRICS.map(m => (
                          <div key={m.key} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-600">{m.label}</span>
                            {scoreBadge(q[m.key])}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
