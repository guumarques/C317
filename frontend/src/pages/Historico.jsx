import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ScoreBadge({ value }) {
  const color = value >= 70 ? "bg-red-100 text-red-700" : value >= 40 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
  const label = value >= 70 ? "Alto" : value >= 40 ? "Moderado" : "Baixo";
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${color}`}>{label} ({value})</span>;
}

export default function Historico() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/questionnaires/history/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject("Erro"))
      .then(setHistory)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button onClick={() => navigate("/home")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">📋 Histórico de questionários</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Seus questionários</h1>
        <p className="text-xs text-gray-400 mb-6">Histórico completo de respostas</p>

        {loading && <div className="text-sm text-gray-400 text-center py-12">Carregando...</div>}
        {error   && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>}
        {!loading && !error && history.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-12">Nenhum questionário respondido ainda.</div>
        )}

        {history.map((q) => (
          <div key={q.id} className="bg-white border border-gray-100 rounded-xl p-4 mb-3 shadow-sm">
            <div className="text-xs text-gray-400 mb-3">
              {new Date(q.answered_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Estresse",  key: "stress_score" },
                { label: "Ansiedade", key: "anxiety_score" },
                { label: "Burnout",   key: "burnout_score" },
                { label: "Depressão", key: "depression_score" },
              ].map(m => (
                <div key={m.key} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-600">{m.label}</span>
                  <ScoreBadge value={q[m.key]} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}