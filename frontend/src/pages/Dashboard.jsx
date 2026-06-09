import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function MetricBar({ label, value }) {
  const pct   = Math.min(value ?? 0, 100);
  const color = pct >= 70 ? "bg-red-400" : pct >= 40 ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{value != null ? Math.round(value) : "—"} / 100</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DeltaBadge({ atual, anterior, label }) {
  const a = atual ?? null;
  const b = anterior ?? null;
  if (a == null || b == null) return <span className="text-gray-400 text-[11px]">—</span>;
  const diff  = Math.round(a - b);
  const better = diff < 0; // menor = melhor para estresse/ansiedade/burnout/depressão
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-none">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{Math.round(a)}</span>
        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${better ? "bg-green-100 text-green-700" : diff === 0 ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-600"}`}>
          {diff === 0 ? "=" : diff > 0 ? `+${diff}` : diff}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data,      setData]      = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [chatStats, setChatStats] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [periodo,   setPeriodo]   = useState("semana"); // "semana" | "mes"
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "manager" && user.role !== "admin") {
      navigate("/home"); return;
    }

    const BASE = "http://localhost:8000/api";

    Promise.all([
      fetch(`${BASE}/dashboard/`,            { headers: authHeaders() }).then(r => r.json()),
      fetch(`${BASE}/dashboard/evolution/`,  { headers: authHeaders() }).then(r => r.json()),
      fetch(`${BASE}/dashboard/chat-stats?/`, { headers: authHeaders() }).then(r => r.json()),
    ])
      .then(([d, e, c]) => { setData(d); setEvolution(e); setChatStats(c); })
      .catch(() => setError("Erro ao carregar dados do dashboard."))
      .finally(() => setLoading(false));
  }, [navigate]);

  const avg     = data?.averages ?? {};
  const evo     = evolution?.[periodo] ?? {};
  const atual   = evo.atual   ?? {};
  const anterior = evo.anterior ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button onClick={() => navigate("/home/gestor")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">Dashboard da equipe</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-xs text-gray-400 mb-6">Dados agregados e anonimizados da equipe</p>

        {loading && <div className="text-sm text-gray-400 text-center py-12">Carregando...</div>}
        {error   && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>}

        {!loading && !error && (
          <>
            {/* Cards de totais */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="text-3xl font-medium text-gray-900">{data?.total_employees ?? "—"}</div>
                <div className="text-xs text-gray-400 mt-1">Funcionários ativos</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="text-3xl font-medium text-gray-900">{data?.total_questionnaires ?? "—"}</div>
                <div className="text-xs text-gray-400 mt-1">Questionários respondidos</div>
              </div>
            </div>

            {/* Saúde média geral */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Saúde média da equipe</h2>
              <MetricBar label="Estresse médio"  value={avg.avg_stress}     />
              <MetricBar label="Ansiedade média" value={avg.avg_anxiety}    />
              <MetricBar label="Burnout médio"   value={avg.avg_burnout}    />
              <MetricBar label="Depressão média" value={avg.avg_depression} />
            </div>

            {/* Relatório de evolução */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800">Relatório de evolução</h2>
                <div className="flex gap-1">
                  {["semana", "mes"].map(p => (
                    <button key={p} onClick={() => setPeriodo(p)}
                      className={`text-[11px] px-3 py-1 rounded-lg transition-colors ${periodo === p ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {p === "semana" ? "Semana" : "Mês"}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mb-3">
                Comparativo: período atual vs período anterior · badge mostra a variação (negativo = melhora)
              </p>
              <DeltaBadge label="Estresse"  atual={atual.avg_stress}     anterior={anterior.avg_stress}     />
              <DeltaBadge label="Ansiedade" atual={atual.avg_anxiety}    anterior={anterior.avg_anxiety}    />
              <DeltaBadge label="Burnout"   atual={atual.avg_burnout}    anterior={anterior.avg_burnout}    />
              <DeltaBadge label="Depressão" atual={atual.avg_depression} anterior={anterior.avg_depression} />
            </div>

            {/* Métricas de uso do LLM */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Uso do chat de apoio</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-medium text-gray-900">{chatStats?.total_sessions ?? "—"}</div>
                  <div className="text-xs text-gray-400 mt-1">Sessões iniciadas</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-medium text-gray-900">{chatStats?.total_messages ?? "—"}</div>
                  <div className="text-xs text-gray-400 mt-1">Mensagens enviadas</div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3">
              Apenas volume de uso. Nenhum conteúdo das conversas é exibido.
              </p>
            </div>

            {/* Aviso LGPD */}
            <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            Dados anonimizados. Nenhuma informação individual é exposta ao gestor.
            </div>
          </>
        )}
      </div>
    </div>
  );
}