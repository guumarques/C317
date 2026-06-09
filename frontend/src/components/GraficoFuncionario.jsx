import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = {
  stress_score:     "#f59e0b",
  anxiety_score:    "#3b82f6",
  burnout_score:    "#ef4444",
  depression_score: "#8b5cf6",
};

const LABELS = {
  stress_score:     "Estresse",
  anxiety_score:    "Ansiedade",
  burnout_score:    "Burnout",
  depression_score: "Depressão",
};

export default function GraficoFuncionario() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/api/questionnaires/history/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(history => {
        // Ordena do mais antigo para o mais recente e pega os últimos 8
        const sorted = [...history].sort((a, b) => new Date(a.answered_at) - new Date(b.answered_at)).slice(-8);
        setData(sorted.map(q => ({
          data: new Date(q.answered_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
          stress_score:     q.stress_score,
          anxiety_score:    q.anxiety_score,
          burnout_score:    q.burnout_score,
          depression_score: q.depression_score,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-gray-400 text-center py-6">Carregando gráfico...</div>;
  if (data.length < 2) return (
    <div className="text-xs text-gray-400 text-center py-6">
      Responda ao menos 2 questionários para ver a tendência.
    </div>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Tendência de saúde mental</h2>
      <p className="text-xs text-gray-400 mb-4">Últimas {data.length} respostas</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="data" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(val, name) => [val, LABELS[name]]}
          />
          <Legend formatter={name => LABELS[name]} wrapperStyle={{ fontSize: 11 }} />
          {Object.keys(COLORS).map(key => (
            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[key]}
              strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}