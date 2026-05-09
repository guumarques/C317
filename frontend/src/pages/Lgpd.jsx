import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Lgpd() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  async function handleConfirm() {
    if (!accepted) {
      setError("Você precisa aceitar os termos para continuar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/auth/lgpd-consent", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lgpd_consent: true }),
      });

      if (!res.ok) {
        setError("Erro ao registrar consentimento. Tente novamente.");
        return;
      }

      // Atualiza o user no localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.lgpd_consent = true;
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/home");
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  function handleRefuse() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Termos de Consentimento
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Leia com atenção antes de continuar
          </p>
        </div>

        {/* Texto LGPD */}
        <div className="bg-gray-50 rounded-xl px-4 py-4 text-xs text-gray-500 leading-relaxed max-h-48 overflow-y-auto mb-6 border border-gray-100">
          <p>
            Em conformidade com a{" "}
            <strong className="text-gray-700">
              Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
            </strong>
            , seus dados de saúde mental são coletados exclusivamente para fins
            de monitoramento de bem-estar corporativo.
          </p>
          <br />
          <p>
            Os dados são <strong className="text-gray-700">anonimizados</strong>{" "}
            para gestores. O psicólogo responsável acessa suas informações apenas
            com seu consentimento expresso. Você pode solicitar a exclusão dos
            seus dados a qualquer momento pelo canal de privacidade da
            plataforma.
          </p>
          <br />
          <p>
            Ao continuar, você declara ter lido e compreendido as finalidades do
            tratamento dos seus dados pessoais conforme descrito neste termo.
          </p>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => {
              setAccepted(e.target.checked);
              setError("");
            }}
            className="mt-0.5 accent-green-700 w-4 h-4 flex-shrink-0"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            Li e aceito os{" "}
            <span className="underline cursor-pointer text-green-700">
              Termos de Uso
            </span>{" "}
            e a{" "}
            <span className="underline cursor-pointer text-green-700">
              Política de Privacidade
            </span>{" "}
            da MentisTech, e autorizo o uso dos meus dados para monitoramento de
            bem-estar.
          </span>
        </label>

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        {/* Botões */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 active:scale-[.98] text-white text-sm font-medium py-2.5 rounded-lg transition-all"
          >
            {loading ? "Registrando..." : "Confirmar e entrar"}
          </button>
          <button
            onClick={handleRefuse}
            className="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm py-2.5 rounded-lg transition-colors"
          >
            Recusar e sair
          </button>
        </div>
      </div>
    </div>
  );
}
