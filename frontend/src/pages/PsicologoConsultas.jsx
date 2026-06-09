import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = { employee_id: "", date: "", notes: "" };

export default function PsicologoConsultas() {
  const [consultations, setConsultations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterEmployee, setFilterEmployee] = useState(""); // filtro por funcionário
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function authH() {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  function loadConsultations() {
    fetch("http://localhost:8000/api/consultations/", { headers: authH() })
      .then((r) => (r.ok ? r.json() : Promise.reject("Erro ao carregar")))
      .then(setConsultations)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  function loadEmployees() {
    function loadEmployees() {
      fetch("http://localhost:8000/api/users/employees/", { headers: authH() })
        .then((r) => (r.ok ? r.json() : []))
        .then(setEmployees)
        .catch(() => {});
    }
  }

  useEffect(() => {
    loadConsultations();
    loadEmployees();
  }, []);

  function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    fetch("http://localhost:8000/api/consultations/", {
      method: "POST",
      headers: authH(),
      body: JSON.stringify(form),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject("Erro ao registrar")))
      .then(() => {
        setCreating(false);
        setForm(EMPTY_FORM);
        loadConsultations();
      })
      .catch(() => alert("Erro ao registrar consulta"))
      .finally(() => setSaving(false));
  }

  function handleDelete(id) {
    fetch(`http://localhost:8000/api/consultations/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        setDeletingId(null);
        loadConsultations();
      })
      .catch(() => alert("Erro ao excluir consulta"));
  }

  // Agrupa por funcionário
  const grouped = {};
  consultations
    .filter((c) => !filterEmployee || c.employee?.id === filterEmployee)
    .forEach((c) => {
      const id = c.employee?.id ?? "unknown";
      const name = c.employee
        ? `${c.employee.first_name} ${c.employee.last_name}`.trim()
        : "Desconhecido";
      if (!grouped[id]) grouped[id] = { name, items: [] };
      grouped[id].items.push(c);
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button
          onClick={() => navigate("/home/psicologo")}
          className="text-white/70 text-xs hover:text-white"
        >
          ← Voltar
        </button>
        <span className="text-white font-medium text-sm flex-1">
          Histórico de consultas
        </span>
        <button
          onClick={() => {
            setCreating(true);
          }}
          className="text-[11px] border border-white/30 text-white px-2.5 py-1 rounded-md hover:bg-white/10"
        >
          + Registrar consulta
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">
          Histórico de consultas
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          Lista de atendimentos registrados por funcionário
        </p>

        {/* Formulário de criação */}
        {creating && (
          <form
            onSubmit={handleCreate}
            className="bg-white border border-green-200 rounded-xl p-4 mb-6 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Registrar consulta
            </h2>

            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">
                Funcionário
              </label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-green-500"
                value={form.employee_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, employee_id: e.target.value }))
                }
                required
              >
                <option value="">Selecione um funcionário</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">
                Data da consulta
              </label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-500"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                required
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">
                Observações <span className="text-gray-300">(opcional)</span>
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs h-20 resize-none focus:outline-none focus:border-green-500"
                placeholder="Anotações sobre a consulta..."
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Salvando..." : "Registrar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setForm(EMPTY_FORM);
                }}
                className="border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Filtro por funcionário */}
        {consultations.length > 0 && (
          <div className="mb-4">
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-green-500"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">Todos os funcionários</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && (
          <div className="text-sm text-gray-400 text-center py-12">
            Carregando...
          </div>
        )}
        {error && (
          <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {!loading && !error && Object.keys(grouped).length === 0 && (
          <div className="text-sm text-gray-400 text-center py-12">
            Nenhuma consulta registrada ainda.
          </div>
        )}

        {/* Agrupado por funcionário */}
        {Object.entries(grouped).map(([uid, { name, items }]) => (
          <div
            key={uid}
            className="bg-white border border-gray-100 rounded-xl mb-4 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                {name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{name}</p>
                <p className="text-[11px] text-gray-400">
                  {items.length} consulta{items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {items.map((c) => (
              <div
                key={c.id}
                className="px-5 py-3 border-b border-gray-50 last:border-none flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {new Date(c.date + "T12:00:00").toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  {c.notes && (
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {c.notes}
                    </p>
                  )}
                </div>

                {/* Excluir */}
                {deletingId !== c.id ? (
                  <button
                    onClick={() => setDeletingId(c.id)}
                    className="text-[11px] text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    Excluir
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1 flex-shrink-0">
                    <span className="text-[11px] text-red-700 mr-1">
                      Excluir?
                    </span>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[11px] bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700"
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-[11px] text-red-600 border border-red-300 px-2 py-0.5 rounded hover:bg-red-100"
                    >
                      Não
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
