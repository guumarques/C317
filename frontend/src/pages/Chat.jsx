import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createChatSession, sendChatMessage, getChatSessions } from "../api";

export default function Chat() {
  const [sessions, setSessions]   = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [starting, setStarting]   = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef(null);
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");

  // Inicia nova sessão ao entrar
  useEffect(() => {
    startNewSession();
    loadSessions();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startNewSession() {
    setStarting(true);
    createChatSession()
      .then((session) => {
        setSessionId(session.id);
        setMessages([{
          role: "assistant",
          content: "Olá! Como você está se sentindo hoje? Estou aqui para ouvir e apoiar. 😊",
        }]);
      })
      .catch(() => {
        setMessages([{
          role: "assistant",
          content: "Não foi possível iniciar a sessão. Tente novamente mais tarde.",
        }]);
      })
      .finally(() => setStarting(false));
  }

  function loadSessions() {
    getChatSessions()
      .then(setSessions)
      .catch(() => {});
  }

  function loadSessionHistory(sid) {
    setShowHistory(false);
    setStarting(true);
    setSessionId(sid);
    fetch(`http://localhost:8000/api/chat/sessions/${sid}/history/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(msgs => setMessages(msgs.map(m => ({ role: m.role, content: m.content }))))
      .catch(() => setMessages([]))
      .finally(() => setStarting(false));
  }

  async function handleSend() {
    if (!input.trim() || !sessionId || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(sessionId, userMsg);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: res.assistant_message.content,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Tente novamente.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-green-700 h-12 flex items-center px-5 gap-3 flex-shrink-0">
        <button onClick={() => navigate("/home/funcionario")} className="text-white/70 text-xs hover:text-white">← Voltar</button>
        <span className="text-white font-medium text-sm flex-1">💬 Chat de acolhimento</span>
        <button
          onClick={() => setShowHistory(h => !h)}
          className="text-[11px] border border-white/30 text-white px-2.5 py-1 rounded-md hover:bg-white/10 transition-colors"
        >
          {showHistory ? "Nova sessão" : "Histórico"}
        </button>
      </div>

      {/* Histórico de sessões anteriores */}
      {showHistory && (
        <div className="max-w-2xl w-full mx-auto px-4 pt-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-700">Conversas anteriores</p>
            </div>
            {sessions.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">Nenhuma conversa anterior.</p>
            )}
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => loadSessionHistory(s.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-none transition-colors"
              >
                <span className="text-xs text-gray-700">
                  Sessão de {new Date(s.started_at).toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
                <span className="text-gray-400 text-xs">Ver →</span>
              </button>
            ))}
            <div className="px-4 py-3 border-t border-gray-100">
              <button
                onClick={() => { setShowHistory(false); startNewSession(); loadSessions(); }}
                className="w-full bg-green-600 text-white text-xs py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Iniciar nova conversa
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 max-w-2xl w-full mx-auto px-4 py-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-amber-700">
          ⚠️ Este chat é de apoio emocional e não substitui atendimento psicológico profissional.
        </div>

        <div
          className="flex-1 bg-white border border-gray-100 rounded-xl p-4 overflow-y-auto flex flex-col gap-3 mb-4"
          style={{ minHeight: 0, maxHeight: "calc(100vh - 280px)" }}
        >
          {starting && <div className="text-xs text-gray-400 text-center">Iniciando sessão...</div>}
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
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-400 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm">
                digitando...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            disabled={loading || starting}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-600 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || starting}
            className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}