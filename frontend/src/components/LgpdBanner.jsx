import { useState, useEffect } from "react";

const STORAGE_KEY = "lgpd_banner_accepted";

export default function LgpdBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg p-4">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-xs text-gray-500 leading-relaxed flex-1">
          Este site utiliza cookies e coleta dados pessoais conforme a{" "}
          <strong className="text-gray-700">LGPD</strong> para
          funcionamento da plataforma. Ao continuar, você concorda com
          nossos{" "}
          <a
            href="#"
            className="text-green-700 underline hover:text-green-800 transition-colors"
          >
            termos de privacidade
          </a>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={accept}
            className="bg-green-700 hover:bg-green-800 active:scale-[.98]
                       text-white text-xs font-medium px-4 py-2 rounded-lg
                       transition-all cursor-pointer"
          >
            Aceitar
          </button>
          <button
            onClick={accept}
            className="border border-gray-200 hover:bg-gray-50 active:scale-[.98]
                       text-gray-500 text-xs font-medium px-4 py-2 rounded-lg
                       transition-all cursor-pointer"
          >
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}
