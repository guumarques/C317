import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitQuestionnaire } from "../api";

const QUESTIONS = [
  { key: "stress_score",     label: "Com que frequência você se sentiu sobrecarregado com o trabalho esta semana?" },
  { key: "anxiety_score",    label: "Com que frequência você se sentiu ansioso ou preocupado com o trabalho?" },
  { key: "burnout_score",    label: "Com que frequência você se sentiu esgotado ou sem energia para trabalhar?" },
  { key: "depression_score", label: "Com que frequência você se sentiu desmotivado ou sem vontade de trabalhar?" },
];

export default function Questionario() {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);
  const navigate = useNavigate();

  const current = QUESTIONS[step];
  const progress = ((step) / QUESTIONS.length) * 100;

  function selectAnswer(val) {
    setAnswers((prev) => ({ ...prev, [current.key]: val * 20 })); 
  }

  async function handleNext() {
    if (answers[current.key] === undefined) {
      setError("Selecione uma opção para continuar.");
      return;
    }
    setError("");

    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    try {
      await submitQuestionnaire(answers);
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Questionário enviado!</h2>
          <p className="text-sm text-gray-400 mb-6">Obrigado por responder. Seus dados foram registrados.</p>
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-base font-semibold text-gray-900">Questionário de bem-estar</h1>
            <span className="text-xs text-gray-400">{step + 1} / {QUESTIONS.length}</span>
          </div>
          <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Este questionário é confidencial</p>
        </div>

        <p className="text-sm font-medium text-gray-800 mb-6 leading-relaxed">
          {current.label}
        </p>

        <div className="flex justify-between text-[11px] text-gray-400 mb-2">
          <span>Nunca</span>
          <span>Sempre</span>
        </div>
        <div className="flex gap-3 justify-between mb-6">
          {[1, 2, 3, 4, 5].map((val) => {
            const score = val * 20;
            const selected = answers[current.key] === score;
            return (
              <button
                key={val}
                onClick={() => { selectAnswer(val); setError(""); }}
                className={`w-12 h-12 rounded-full border text-sm font-medium transition-all ${
                  selected
                    ? "bg-green-700 text-white border-green-700"
                    : "border-gray-200 text-gray-500 hover:border-green-500"
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Anterior
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Enviando..." : step < QUESTIONS.length - 1 ? "Próxima →" : "Enviar"}
          </button>
        </div>

        <p
          onClick={() => navigate("/home")}
          className="text-center text-xs text-gray-400 hover:text-gray-600 mt-4 cursor-pointer"
        >
          Salvar e continuar depois
        </p>
      </div>
    </div>
  );
}
