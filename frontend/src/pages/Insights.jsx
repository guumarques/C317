import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInsights } from "../api";

function StatusBadge({ status }) {
  if (status === "validated")
    return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Recomendação do psicólogo</span>;
  if (status === "rejected")
    return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Não aplicável</span>;
  return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pendente</span>;
}

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Agrupa insights por mês/ano para exibir como histórico
  const grouped = insights.reduce((acc, ins) => {
    const date  = new Date(ins.created_at);
    const key   = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(ins);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button onClick={() => navigate("/home/funcionario")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">Meus insights</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Seus insights</h1>
        <p className="text-xs text-gray-400 mb-6">Recomendações do seu psicólogo · histórico por data</p>

        {loading && <div className="text-sm text-gray-400 text-center py-12">Carregando...</div>}
        {error   && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>}
        {!loading && !error && insights.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-12">Nenhum insight disponível ainda.</div>
        )}

        {Object.entries(grouped).map(([month, items]) => (
          <div key={month} className="mb-6">
            {/* Separador de mês */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider capitalize">{month}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {items.map((insight) => (
              <div
                key={insight.id}
                className="border-l-4 border-green-500 bg-white rounded-r-xl px-4 py-4 mb-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">
                    {new Date(insight.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </span>
                  <StatusBadge status={insight.status} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{insight.content}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
