import { useEffect, useState } from "react";

const METRICS = [
  { key: "stress_score",     label: "Estresse",  color: "#f59e0b" },
  { key: "anxiety_score",    label: "Ansiedade", color: "#3b82f6" },
  { key: "burnout_score",    label: "Burnout",   color: "#ef4444" },
  { key: "depression_score", label: "Depressão", color: "#8b5cf6" },
];

const W = 600, H = 180, PAD = { top: 10, right: 10, bottom: 30, left: 30 };
const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;

function LineGraph({ data }) {
  if (data.length < 2) return null;
  const xStep = innerW / (data.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = PAD.top + innerH - (v / 100) * innerH;
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={PAD.left - 4} y={y + 3} textAnchor="end" fontSize={9} fill="#aaa">{v}</text>
          </g>
        );
      })}

      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={PAD.left + i * xStep} y={H - 6} textAnchor="middle" fontSize={9} fill="#aaa">
          {d.date}
        </text>
      ))}

      {/* Lines */}
      {METRICS.map(m => {
        const points = data.map((d, i) => {
          const x = PAD.left + i * xStep;
          const y = PAD.top + innerH - (d[m.key] / 100) * innerH;
          return `${x},${y}`;
        }).join(" ");
        return (
          <g key={m.key}>
            <polyline points={points} fill="none" stroke={m.color} strokeWidth={2} strokeLinejoin="round" />
            {data.map((d, i) => (
              <circle key={i}
                cx={PAD.left + i * xStep}
                cy={PAD.top + innerH - (d[m.key] / 100) * innerH}
                r={3} fill={m.color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

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
        const sorted = [...history]
          .sort((a, b) => new Date(a.answered_at) - new Date(b.answered_at))
          .slice(-8);
        setData(sorted.map(q => ({
          date: new Date(q.answered_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
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
      <p className="text-xs text-gray-400 mb-3">Últimas {data.length} respostas</p>
      <LineGraph data={data} />
      <div className="flex flex-wrap gap-3 mt-3">
        {METRICS.map(m => (
          <div key={m.key} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: m.color }} />
            <span className="text-[11px] text-gray-500">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}