import { useEffect, useState } from "react";

const METRICS = [
  { key: "stress_score", label: "Estresse", color: "#f59e0b" },
  { key: "anxiety_score", label: "Ansiedade", color: "#3b82f6" },
  { key: "burnout_score", label: "Burnout", color: "#ef4444" },
  { key: "depression_score", label: "Depressão", color: "#8b5cf6" },
];

const W = 600,
  H = 180,
  PAD = { top: 10, right: 10, bottom: 30, left: 30 };
const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;

function LineGraph({ data }) {
  if (!data || data.length < 2)
    return (
      <div className="text-xs text-gray-400 text-center py-4">
        Funcionário precisa de ao menos 2 respostas para exibir tendência.
      </div>
    );
  const xStep = innerW / (data.length - 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      {[0, 25, 50, 75, 100].map((v) => {
        const y = PAD.top + innerH - (v / 100) * innerH;
        return (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 4}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="#aaa"
            >
              {v}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => (
        <text
          key={i}
          x={PAD.left + i * xStep}
          y={H - 6}
          textAnchor="middle"
          fontSize={9}
          fill="#aaa"
        >
          {d.date}
        </text>
      ))}
      {METRICS.map((m) => {
        const points = data
          .map((d, i) => {
            const x = PAD.left + i * xStep;
            const y = PAD.top + innerH - (d[m.key] / 100) * innerH;
            return `${x},${y}`;
          })
          .join(" ");
        return (
          <g key={m.key}>
            <polyline
              points={points}
              fill="none"
              stroke={m.color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {data.map((d, i) => (
              <circle
                key={i}
                cx={PAD.left + i * xStep}
                cy={PAD.top + innerH - (d[m.key] / 100) * innerH}
                r={3}
                fill={m.color}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function BarGraph({ data }) {
  if (!data || data.length === 0)
    return (
      <div className="text-xs text-gray-400 text-center py-4">
        Nenhum dado disponível.
      </div>
    );
  const BW = 600,
    BH = 180,
    BPAD = { top: 10, right: 10, bottom: 30, left: 30 };
  const bInnerW = BW - BPAD.left - BPAD.right;
  const bInnerH = BH - BPAD.top - BPAD.bottom;
  const groupW = bInnerW / data.length;
  const barW = Math.min(groupW / (METRICS.length + 1), 18);

  return (
    <svg viewBox={`0 0 ${BW} ${BH}`} className="w-full" style={{ height: 180 }}>
      {[0, 25, 50, 75, 100].map((v) => {
        const y = BPAD.top + bInnerH - (v / 100) * bInnerH;
        return (
          <g key={v}>
            <line
              x1={BPAD.left}
              x2={BW - BPAD.right}
              y1={y}
              y2={y}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
            <text
              x={BPAD.left - 4}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="#aaa"
            >
              {v}
            </text>
          </g>
        );
      })}
      {data.map((emp, ei) => {
        const gx = BPAD.left + ei * groupW + groupW / 2;
        return (
          <g key={ei}>
            <text
              x={gx}
              y={BH - 6}
              textAnchor="middle"
              fontSize={9}
              fill="#aaa"
            >
              {emp.name}
            </text>
            {METRICS.map((m, mi) => {
              const val = emp[m.key] ?? 0;
              const bh = (val / 100) * bInnerH;
              const bx = gx - (METRICS.length * barW) / 2 + mi * barW;
              const by = BPAD.top + bInnerH - bh;
              return (
                <rect
                  key={m.key}
                  x={bx}
                  y={by}
                  width={barW - 2}
                  height={bh}
                  fill={m.color}
                  rx={2}
                  opacity={0.85}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default function GraficoPsicologo() {
  const [allData, setAllData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState("");
  const [chartData, setChartData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  function authH() {
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/questionnaires/all/", { headers: authH() })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setAllData(data);
        const seen = {};
        data.forEach((q) => {
          const u = q.user;
          if (u && !seen[u.id] && u.role === "employee")
            seen[u.id] = {
              id: u.id,
              name: `${u.first_name} ${u.last_name}`.trim(),
            };
        });
        const emps = Object.values(seen);
        setEmployees(emps);

        const bars = emps.map((emp) => {
          const items = data.filter((q) => q.user?.id === emp.id);
          const avg = (key) =>
            items.length
              ? Math.round(items.reduce((s, q) => s + q[key], 0) / items.length)
              : 0;
          return {
            name: emp.name.split(" ")[0],
            stress_score: avg("stress_score"),
            anxiety_score: avg("anxiety_score"),
            burnout_score: avg("burnout_score"),
            depression_score: avg("depression_score"),
          };
        });
        setBarData(bars);
        if (emps.length > 0) selectEmployee(emps[0].id, data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function selectEmployee(empId, override) {
    const source = override ?? allData;
    setSelected(empId);
    const items = source
      .filter((q) => q.user?.id === empId)
      .sort((a, b) => new Date(a.answered_at) - new Date(b.answered_at))
      .slice(-8);
    setChartData(
      items.map((q) => ({
        date: new Date(q.answered_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        stress_score: q.stress_score,
        anxiety_score: q.anxiety_score,
        burnout_score: q.burnout_score,
        depression_score: q.depression_score,
      })),
    );
  }

  if (loading)
    return (
      <div className="text-xs text-gray-400 text-center py-6">
        Carregando...
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          Média da equipe por funcionário
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Média de todos os questionários respondidos
        </p>
        <BarGraph data={barData} />
        <div className="flex flex-wrap gap-3 mt-3">
          {METRICS.map((m) => (
            <div key={m.key} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: m.color }}
              />
              <span className="text-[11px] text-gray-500">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-800">
            Tendência individual
          </h2>
          <select
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-green-500"
            value={selected}
            onChange={(e) => selectEmployee(e.target.value)}
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Últimas respostas do funcionário selecionado
        </p>
        <LineGraph data={chartData} />
        <div className="flex flex-wrap gap-3 mt-3">
          {METRICS.map((m) => (
            <div key={m.key} className="flex items-center gap-1.5">
              <div
                className="w-3 h-0.5 rounded"
                style={{ backgroundColor: m.color }}
              />
              <span className="text-[11px] text-gray-500">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
