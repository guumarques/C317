import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInsights } from "../api";

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

  function statusBadge(status) {
    if (status === "validated")
      return <span className="text-[10px] bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded-full">Psicólogo validou</span>;
    return <span className="text-[10px] bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">Gerado por IA</span>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button onClick={() => navigate("/home")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">💡 Insights</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Seus insights</h1>
        <p className="text-xs text-gray-400 mb-6">Gerados pela IA e revisados pelo psicólogo</p>

        {loading && (
          <div className="text-sm text-gray-400 text-center py-12">Carregando...</div>
        )}

        {error && (
          <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>
        )}

        {!loading && !error && insights.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-12">
            Nenhum insight disponível ainda.
          </div>
        )}

        {insights.map((insight) => (
          <div
            key={insight.id}
            className="border-l-4 border-green-500 bg-white rounded-r-xl px-4 py-4 mb-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">
                {new Date(insight.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </span>
              {statusBadge(insight.status)}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{insight.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
