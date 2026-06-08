import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PsicologoChats() {
  const [sessions, setSessions]     = useState([]);
  const [messages, setMessages]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError]           = useState("");
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  function authH() {
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/chat/sessions/", { headers: authH() })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao carregar sessões"))
      .then(setSessions)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  function loadMessages(session) {
    setSelected(session);
    setLoadingMsgs(true);
    fetch(`http://localhost:8000/api/chat/sessions/${session.id}/history/`, { headers: authH() })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao carregar mensagens"))
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3 flex-shrink-0">
        <button onClick={() => navigate("/home/psicologo")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">💬 Acompanhamento de atendimentos</span>
      </div>

      <div className="flex flex-1 min-h-0 max-w-5xl mx-auto w-full px-4 py-6 gap-4">

        {/* Lista de sessões */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Sessões</p>

          {loading && <div className="text-sm text-gray-400 text-center py-8">Carregando...</div>}
          {error   && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</div>}
          {!loading && !error && sessions.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-8">Nenhuma sessão encontrada.</div>
          )}

          {sessions.map(s => {
            const name = s.user?.first_name
              ? `${s.user.first_name} ${s.user.last_name ?? ""}`.trim()
              : s.user?.username ?? "Funcionário";
            const isSelected = selected?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => loadMessages(s)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  isSelected
                    ? "bg-green-50 border-green-300"
                    : "bg-white border-gray-100 hover:border-green-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700 flex-shrink-0">
                    {name[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-gray-800 truncate">{name}</span>
                </div>
                <div className="text-[11px] text-gray-400 pl-8">
                  {new Date(s.started_at).toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </button>
            );
          })}
        </div>

        {/* Visualização das mensagens */}
        <div className="flex-1 bg-white border border-gray-100 rounded-xl flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Selecione uma sessão para visualizar
            </div>
          ) : (
            <>
              {/* Header da sessão */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                  {(selected.user?.first_name ?? "F")[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    {selected.user?.first_name
                      ? `${selected.user.first_name} ${selected.user.last_name ?? ""}`.trim()
                      : selected.user?.username ?? "Funcionário"}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(selected.started_at).toLocaleDateString("pt-BR", {
                      day: "2-digit", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Somente leitura
                </span>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {loadingMsgs && (
                  <div className="text-xs text-gray-400 text-center py-4">Carregando mensagens...</div>
                )}
                {!loadingMsgs && messages.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">Nenhuma mensagem nesta sessão.</div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-green-700 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}