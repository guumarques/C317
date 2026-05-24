import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../api";

function MetricBar({ label, value }) {
  const pct = Math.min(value ?? 0, 100);
  const color =
    pct >= 70 ? "bg-red-400" :
    pct >= 40 ? "bg-amber-400" :
    "bg-green-500";

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{value !== null && value !== undefined ? Math.round(value) : "—"} / 100</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "manager" && user.role !== "admin") {
      navigate("/home");
      return;
    }
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const avg = data?.averages ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button onClick={() => navigate("/home")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">📊 Dashboard da equipe</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-xs text-gray-400 mb-6">Dados agregados e anonimizados da equipe</p>

        {loading && <div className="text-sm text-gray-400 text-center py-12">Carregando...</div>}
        {error   && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="text-3xl font-medium text-gray-900">{data.total_employees}</div>
                <div className="text-xs text-gray-400 mt-1">Funcionários ativos</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="text-3xl font-medium text-gray-900">{data.total_questionnaires}</div>
                <div className="text-xs text-gray-400 mt-1">Questionários respondidos</div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Saúde média da equipe</h2>
              <MetricBar label="Estresse médio"  value={avg.avg_stress}     />
              <MetricBar label="Ansiedade média" value={avg.avg_anxiety}    />
              <MetricBar label="Burnout médio"   value={avg.avg_burnout}    />
              <MetricBar label="Depressão média" value={avg.avg_depression} />
            </div>

            <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              ℹ️ Dados anonimizados. Nenhuma informação individual é exposta ao gestor.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
