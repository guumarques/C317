import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

const METRICS = [
  { key: "stress_score",     label: "Estresse",  color: "#f59e0b" },
  { key: "anxiety_score",    label: "Ansiedade", color: "#3b82f6" },
  { key: "burnout_score",    label: "Burnout",   color: "#ef4444" },
  { key: "depression_score", label: "Depressão", color: "#8b5cf6" },
];

export default function GraficoPsicologo() {
  const [allData, setAllData]         = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [selected, setSelected]       = useState("");
  const [chartData, setChartData]     = useState([]);
  const [barData, setBarData]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const token = localStorage.getItem("token");

  function authH() {
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/questionnaires/all/", { headers: authH() })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setAllData(data);

        // Extrai funcionários únicos
        const seen = {};
        data.forEach(q => {
          const u = q.user;
          if (u && !seen[u.id]) seen[u.id] = { id: u.id, name: `${u.first_name} ${u.last_name}`.trim() };
        });
        const emps = Object.values(seen);
        setEmployees(emps);

        // Médias por funcionário para o bar chart
        const bars = emps.map(emp => {
          const items = data.filter(q => q.user?.id === emp.id);
          const avg = key => items.length ? Math.round(items.reduce((s, q) => s + q[key], 0) / items.length) : 0;
          return {
            name: emp.name.split(" ")[0], // só primeiro nome para caber
            Estresse:  avg("stress_score"),
            Ansiedade: avg("anxiety_score"),
            Burnout:   avg("burnout_score"),
            Depressão: avg("depression_score"),
          };
        });
        setBarData(bars);

        // Seleciona o primeiro funcionário por padrão
        if (emps.length > 0) selectEmployee(emps[0].id, data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function selectEmployee(empId, data_override) {
    const source = data_override ?? allData;
    setSelected(empId);
    const items = source
      .filter(q => q.user?.id === empId)
      .sort((a, b) => new Date(a.answered_at) - new Date(b.answered_at))
      .slice(-8);
    setChartData(items.map(q => ({
      data: new Date(q.answered_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      stress_score:     q.stress_score,
      anxiety_score:    q.anxiety_score,
      burnout_score:    q.burnout_score,
      depression_score: q.depression_score,
    })));
  }

  if (loading) return <div className="text-xs text-gray-400 text-center py-6">Carregando...</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Bar chart — média por funcionário */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">Média da equipe por funcionário</h2>
        <p className="text-xs text-gray-400 mb-4">Média de todos os questionários respondidos</p>
        {barData.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">Nenhum dado disponível.</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {METRICS.map(m => <Bar key={m.key} dataKey={m.label} fill={m.color} radius={[3, 3, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Line chart — tendência individual */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-800">Tendência individual</h2>
          <select
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-green-500"
            value={selected}
            onChange={e => selectEmployee(e.target.value)}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-400 mb-4">Últimas respostas do funcionário selecionado</p>
        {chartData.length < 2 ? (
          <div className="text-xs text-gray-400 text-center py-4">
            Funcionário precisa de ao menos 2 respostas para exibir tendência.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(val, name) => [val, METRICS.find(m => m.key === name)?.label ?? name]}
              />
              <Legend
                formatter={name => METRICS.find(m => m.key === name)?.label ?? name}
                wrapperStyle={{ fontSize: 11 }}
              />
              {METRICS.map(m => (
                <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color}
                  strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}