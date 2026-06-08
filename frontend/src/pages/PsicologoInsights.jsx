import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_LABELS = { pending: "Pendente", validated: "Validado", rejected: "Rejeitado" };
const STATUS_COLORS = {
  pending:   "bg-amber-100 text-amber-700",
  validated: "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
};

const EMPTY_FORM = { questionnaire: "", content: "", status: "validated" };

export default function PsicologoInsights() {
  const [insights, setInsights]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [creating, setCreating]         = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [editContent, setEditContent]   = useState("");
  const [editSaving, setEditSaving]     = useState(false);
  const [deletingId, setDeletingId]     = useState(null);

  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  function authH() {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }

  function loadInsights() {
    setLoading(true);
    fetch("http://localhost:8000/api/insights/", { headers: authH() })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao carregar insights"))
      .then(setInsights)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadInsights(); }, []);

  function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    fetch("http://localhost:8000/api/insights/", {
      method: "POST",
      headers: authH(),
      body: JSON.stringify(form),
    })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao criar insight"))
      .then(() => { setCreating(false); setForm(EMPTY_FORM); loadInsights(); })
      .catch(() => alert("Erro ao criar insight"))
      .finally(() => setSaving(false));
  }

  function handlePatch(id, data) {
    fetch(`http://localhost:8000/api/insights/${id}/`, {
      method: "PATCH",
      headers: authH(),
      body: JSON.stringify(data),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => loadInsights())
      .catch(() => alert("Erro ao atualizar insight"));
  }

  function startEdit(ins) {
    setEditingId(ins.id);
    setEditContent(ins.content);
    setDeletingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  function handleEdit(id) {
    if (!editContent.trim()) return;
    setEditSaving(true);
    fetch(`http://localhost:8000/api/insights/${id}/`, {
      method: "PATCH",
      headers: authH(),
      body: JSON.stringify({ content: editContent.trim() }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => { cancelEdit(); loadInsights(); })
      .catch(() => alert("Erro ao salvar edição"))
      .finally(() => setEditSaving(false));
  }

  function handleDelete(id) {
    fetch(`http://localhost:8000/api/insights/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error();
        setDeletingId(null);
        loadInsights();
      })
      .catch(() => alert("Erro ao excluir insight"));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3">
        <button onClick={() => navigate("/home/psicologo")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">💡 Gerenciar insights</span>
        <button
          onClick={() => { setCreating(true); setEditingId(null); setDeletingId(null); }}
          className="text-[11px] border border-white/30 text-white px-2.5 py-1 rounded-md hover:bg-white/10"
        >
          + Novo insight
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Insights da empresa</h1>
        <p className="text-xs text-gray-400 mb-6">Crie, edite, valide e exclua insights para os funcionários</p>

        {creating && (
          <form onSubmit={handleCreate} className="bg-white border border-green-200 rounded-xl p-4 mb-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Novo insight</h2>
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">ID do questionário</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-500"
                placeholder="UUID do questionário"
                value={form.questionnaire}
                onChange={e => setForm(f => ({ ...f, questionnaire: e.target.value }))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Conteúdo</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs h-24 resize-none focus:outline-none focus:border-green-500"
                placeholder="Texto do insight e recomendações..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button type="button" onClick={() => { setCreating(false); setForm(EMPTY_FORM); }}
                className="border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading && <div className="text-sm text-gray-400 text-center py-12">Carregando...</div>}
        {error   && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</div>}
        {!loading && !error && insights.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-12">Nenhum insight encontrado.</div>
        )}

        {insights.map((ins) => (
          <div key={ins.id} className="bg-white border border-gray-100 rounded-xl p-4 mb-3 shadow-sm">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[ins.status]}`}>
                {STATUS_LABELS[ins.status]}
              </span>
              <div className="flex items-center gap-1 ml-auto">
                {editingId !== ins.id && (
                  <button onClick={() => startEdit(ins)}
                    className="text-[11px] text-white bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 rounded-lg transition-colors">
                    Editar
                  </button>
                )}
                {deletingId !== ins.id ? (
                  <button onClick={() => { setDeletingId(ins.id); setEditingId(null); }}
                    className="text-[11px] text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
                    Excluir
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                    <span className="text-[11px] text-red-700 mr-1">Confirmar exclusão?</span>
                    <button onClick={() => handleDelete(ins.id)}
                      className="text-[11px] bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 transition-colors">
                      Sim
                    </button>
                    <button onClick={() => setDeletingId(null)}
                      className="text-[11px] text-red-600 border border-red-300 px-2 py-0.5 rounded hover:bg-red-100 transition-colors">
                      Não
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo ou textarea de edição */}
            {editingId === ins.id ? (
              <div className="mb-3">
                <textarea
                  className="w-full border border-green-300 rounded-lg px-3 py-2 text-xs h-24 resize-none focus:outline-none focus:border-green-500 bg-green-50/30"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(ins.id)} disabled={editSaving || !editContent.trim()}
                    className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {editSaving ? "Salvando..." : "Salvar edição"}
                  </button>
                  <button onClick={cancelEdit}
                    className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-700 leading-relaxed mb-2">{ins.content}</p>
            )}

            {/* Metadata */}
            <div className="text-[11px] text-gray-400 mb-3">
              Funcionário: <span className="text-gray-600">{ins.user ?? "—"}</span>
              {" · "}
              {new Date(ins.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}