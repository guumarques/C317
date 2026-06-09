import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MinhasConsultas() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  function authH() {
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/consultations/", { headers: authH() })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao carregar"))
      .then(setConsultations)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const hoje      = new Date().toISOString().split("T")[0];
  const agendadas = consultations.filter(c => c.date >= hoje).sort((a, b) => a.date.localeCompare(b.date));
  const realizadas = consultations.filter(c => c.date < hoje).sort((a, b) => b.date.localeCompare(a.date));

  function renderConsultation(c) {
    const psicologo = c.psychologist
      ? `${c.psychologist.first_name} ${c.psychologist.last_name}`.trim()
      : "Psicólogo";
    return (
      <div key={c.id} className="bg-white border border-gray-100 rounded-xl px-5 py-4 mb-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700 flex-shrink-0">
            {psicologo[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">{psicologo}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {new Date(c.date + "T12:00:00").toLocaleDateString("pt-BR", {
                day: "2-digit", month: "long", year: "numeric",
              })}
              {c.time && ` às ${c.time.slice(0, 5)}`}
            </p>
            {c.notes && <p className="text-xs text-gray-400 mt-1">{c.notes}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button onClick={() => navigate("/home/funcionario")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">Minhas consultas</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Minhas consultas</h1>
        <p className="text-xs text-gray-400 mb-6">Agendamentos com seu psicólogo</p>

        {loading && <div className="text-sm text-gray-400 text-center py-12">Carregando...</div>}
        {error   && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>}
        {!loading && !error && consultations.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-12">Nenhuma consulta agendada ainda.</div>
        )}

        {agendadas.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-medium text-blue-600 uppercase tracking-wider">Agendadas</span>
              <div className="flex-1 h-px bg-blue-100" />
              <span className="text-[11px] text-blue-400">{agendadas.length}</span>
            </div>
            {agendadas.map(renderConsultation)}
          </div>
        )}

        {realizadas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Realizadas</span>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400">{realizadas.length}</span>
            </div>
            {realizadas.map(renderConsultation)}
          </div>
        )}
      </div>
    </div>
  );
}