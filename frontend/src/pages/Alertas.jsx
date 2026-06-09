import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/alerts/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao buscar alertas"))
      .then(setAlertas)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button onClick={() => navigate("/home/gestor")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">Alertas de funcionários</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Alertas</h1>
        <p className="text-xs text-gray-400 mb-6">Funcionários com scores críticos que precisam de atenção</p>

        {loading && <div className="text-sm text-gray-400 text-center py-12">Carregando...</div>}
        {error   && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>}

        {!loading && !error && alertas.length === 0 && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-6 text-center">
            <CheckCircle size={28} className="text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-700">Nenhum alerta no momento</div>
            <div className="text-xs text-green-600 mt-1">Todos os funcionários estão dentro dos níveis normais</div>
          </div>
        )}

        {alertas.map((a, i) => (
          <div key={i} className="bg-white border border-red-100 rounded-xl p-4 mb-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-800 capitalize">{a.usuario}</span>
              <span className="ml-auto text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium capitalize">{a.tipo}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{a.motivo}</p>
            <p className="text-[11px] text-gray-400">
              {new Date(a.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}