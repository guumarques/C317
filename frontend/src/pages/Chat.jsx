import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const [session, setSession]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [starting, setStarting] = useState(true);
  const [error, setError]       = useState("");
  const bottomRef = useRef(null);
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");

  function authH() {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }

  useEffect(() => {
    // 1. Busca o psicólogo da empresa
    fetch("http://localhost:8000/api/users/psychologist/", { headers: authH() })
      .then(r => r.ok ? r.json() : Promise.reject("Psicólogo não encontrado"))
      .then(psychologist => {
        // 2. Cria ou recupera a sessão com esse psicólogo
        return fetch("http://localhost:8000/api/chat/sessions/create/", {
          method: "POST",
          headers: authH(),
          body: JSON.stringify({ psychologist_id: psychologist.id }),
        });
      })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao criar sessão"))
      .then(s => {
        setSession(s);
        return fetch(`http://localhost:8000/api/chat/sessions/${s.id}/history/`, { headers: authH() });
      })
      .then(r => r.ok ? r.json() : [])
      .then(setMessages)
      .catch(e => setError(String(e)))
      .finally(() => setStarting(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !session || loading) return;
    const content = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "employee", content, sent_at: new Date().toISOString() }]);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/chat/sessions/${session.id}/messages/`, {
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

  const psychologistName = session
    ? `${session.psychologist?.first_name ?? ""} ${session.psychologist?.last_name ?? ""}`.trim()
    : "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3 flex-shrink-0">
        <button onClick={() => navigate("/home/funcionario")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">
          {psychologistName ? `Chat com ${psychologistName}` : "Chat com psicólogo"}
        </span>
      </div>

      <div className="flex flex-col flex-1 max-w-2xl w-full mx-auto px-4 py-4">
        {starting && (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Carregando...</div>
        )}
        {!starting && error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
            <span className="text-3xl">💬</span>
            <p className="text-sm font-medium text-gray-700">Nenhum psicólogo disponível</p>
            <p className="text-xs text-gray-400">Aguarde um psicólogo ser atribuído à sua empresa.</p>
          </div>
        )}
        {!starting && !error && session && (
          <>
            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 overflow-y-auto flex flex-col gap-3 mb-4"
              style={{ minHeight: 0, maxHeight: "calc(100vh - 200px)" }}>
              {messages.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-4">Nenhuma mensagem ainda. Inicie a conversa.</div>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.role === "employee";
                return (
                  <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
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
            <div className="flex gap-2">
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
  );
}