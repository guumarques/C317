import { useState } from "react";

const LGPD_TERMS = `
1. Coleta de Dados
Coletamos seu nome e e-mail corporativo para
identificação e comunicação dentro da plataforma.

2. Finalidade
Seus dados são utilizados exclusivamente para:
- Gerenciamento de sua conta na plataforma MentisTech
- Comunicação sobre seu plano de saúde mental
- Geração de relatórios anonimizados para a empresa

3. Compartilhamento
Não compartilhamos seus dados com terceiros sem
seu consentimento explícito, exceto por obrigação legal.

4. Direitos do Titular
Você pode solicitar a qualquer momento:
- Acesso, correção ou exclusão dos seus dados
- Revogação deste consentimento
- Portabilidade dos dados

5. Retenção
Seus dados serão mantidos enquanto sua conta estiver
ativa. Após exclusão da conta, os dados serão removidos
em até 90 dias.

6. Contato
Para exercer seus direitos, entre em contato:
lgpd@mentistech.com.br
`;

export default function LgpdConsent({ checked, onChange, error }) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <div className="flex items-start gap-2">
        <input
          id="lgpd-consent"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-700
                     focus:ring-green-600 focus:ring-offset-0
                     accent-green-700 cursor-pointer shrink-0"
        />
        <label htmlFor="lgpd-consent" className="text-xs text-gray-500 leading-relaxed select-none">
          Aceito os{" "}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="text-green-700 underline hover:text-green-800 transition-colors cursor-pointer"
          >
            termos de privacidade
          </button>{" "}
          e autorizo o tratamento dos meus dados conforme a LGPD.
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowTerms(false)}
          />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Termos de Privacidade — LGPD
              </h2>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {LGPD_TERMS}
            </div>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="mt-5 w-full bg-green-700 hover:bg-green-800 active:scale-[.98]
                         text-white text-sm font-medium py-2.5 rounded-lg transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
