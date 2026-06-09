import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createChatSession, sendChatMessage } from "../api";

export default function Chat() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    createChatSession()
      .then((session) => {
        setSessionId(session.id);
        setMessages([
          {
            role: "assistant",
            content:
              "Olá! Como você está se sentindo hoje? Estou aqui para ouvir e apoiar. 😊",
          },
        ]);
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "Não foi possível iniciar a sessão. Tente novamente mais tarde.",
          },
        ]);
      })
      .finally(() => setStarting(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !sessionId || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(sessionId, userMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.assistant_message.content,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Tente novamente.",
        },
      ]);
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
        <button
          onClick={() => navigate("/home")}
          className="text-white/70 text-xs hover:text-white"
        >
          ← Voltar
        </button>
        <span className="text-white font-medium text-sm flex-1">
          💬 Chat de acolhimento
        </span>
      </div>

      <div className="flex flex-col flex-1 max-w-2xl w-full mx-auto px-4 py-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-amber-700">
          ⚠️ Este chat é de apoio emocional e não substitui atendimento
          psicológico profissional.
        </div>

        <div
          data-cy="chat-messages"
          className="flex-1 bg-white border border-gray-100 rounded-xl p-4 overflow-y-auto flex flex-col gap-3 mb-4"
          style={{ minHeight: 0, maxHeight: "calc(100vh - 220px)" }}
        >
          {starting && (
            <div className="text-xs text-gray-400 text-center">
              Iniciando sessão...
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-green-700 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
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
            data-cy="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            disabled={loading || starting}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-600 transition-colors disabled:opacity-50"
          />
          <button
            data-cy="chat-send-button"
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
