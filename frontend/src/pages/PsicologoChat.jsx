import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function PsicologoChat() {
  const [employees, setEmployees] = useState([]);
  const [sessions, setSessions]   = useState({});  // { employee_id: session }
  const [selected, setSelected]   = useState(null);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef(null);
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");

  function authH() {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }

  useEffect(() => {
    // Carrega funcionários
    fetch("http://localhost:8000/api/users/employees/", { headers: authH() })
      .then(r => r.ok ? r.json() : [])
      .then(setEmployees)
      .catch(() => {});

    // Carrega sessões existentes e mapeia por employee id
    fetch("http://localhost:8000/api/chat/sessions/", { headers: authH() })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const map = {};
        data.forEach(s => { if (s.employee?.id) map[s.employee.id] = s; });
        setSessions(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function openChat(emp) {
    const existing = sessions[emp.id];
    if (existing) {
      setSelected({ session: existing, employee: emp });
      loadMessages(existing.id);
      return;
    }
    // Cria sessão nova
    fetch("http://localhost:8000/api/chat/sessions/create/", {
      method: "POST",
      headers: authH(),
      body: JSON.stringify({ employee_id: emp.id }),
    })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao criar sessão"))
      .then(s => {
        setSessions(prev => ({ ...prev, [emp.id]: s }));
        setSelected({ session: s, employee: emp });
        setMessages([]);
      })
      .catch(() => alert("Erro ao abrir chat"));
  }

  function loadMessages(sessionId) {
    setLoadingMsgs(true);
    setMessages([]);
    fetch(`http://localhost:8000/api/chat/sessions/${sessionId}/history/`, { headers: authH() })
      .then(r => r.ok ? r.json() : [])
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }

  async function handleSend() {
    if (!input.trim() || !selected || loading) return;
    const content = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "psychologist", content, sent_at: new Date().toISOString() }]);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/chat/sessions/${selected.session.id}/messages/`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setMessages(prev => [...prev, { role: "system", content: "Erro ao enviar mensagem." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3 flex-shrink-0">
        <button onClick={() => navigate("/home/psicologo")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">Chat com funcionários</span>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {employees.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8 px-4">Nenhum funcionário encontrado.</p>
            )}
            {employees.map(emp => {
              const name = `${emp.first_name} ${emp.last_name}`.trim() || emp.username;
              const hasSession = !!sessions[emp.id];
              const isSelected = selected?.employee?.id === emp.id;
              return (
                <button key={emp.id} onClick={() => openChat(emp)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isSelected ? "bg-green-50" : ""}`}>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700 flex-shrink-0">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-medium text-gray-800">{name}</p>
                    <p className="text-[11px] text-gray-400">{hasSession ? "Conversa iniciada" : "Sem conversa ainda"}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Área do chat */}
        <div className="flex-1 flex flex-col min-h-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Selecione um funcionário para conversar
            </div>
          ) : (
            <>
              <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                  {(selected.employee?.first_name ?? "F")[0]?.toUpperCase()}
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {`${selected.employee?.first_name ?? ""} ${selected.employee?.last_name ?? ""}`.trim()}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {loadingMsgs && <div className="text-xs text-gray-400 text-center py-4">Carregando...</div>}
                {!loadingMsgs && messages.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">Nenhuma mensagem ainda.</div>
                )}
                {messages.map((msg, i) => {
                  const isMine = msg.role === "psychologist";
                  return (
                    <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isMine ? "bg-green-700 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div className="flex justify-end">
                    <div className="bg-green-100 text-green-400 rounded-2xl px-4 py-2.5 text-sm">enviando...</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 flex-shrink-0">
                <input type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma mensagem..."
                  disabled={loading}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-600 transition-colors disabled:opacity-50"
                />
                <button onClick={handleSend} disabled={!input.trim() || loading}
                  className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}