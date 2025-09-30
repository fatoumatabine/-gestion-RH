export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-5 text-center dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600`}
    >
      <div className="mb-3">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full mb-3">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white text-sm">
        Gestion RH Simplifiée
      </h3>
      <p className="mb-4 text-gray-600 text-xs dark:text-gray-300 leading-relaxed">
        Système complet de gestion des employés et des salaires pour votre entreprise.
      </p>

      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center space-x-1">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Sécurisé & RGPD</span>
        </div>
        <div className="flex items-center justify-center space-x-1">
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Support 24/7</span>
        </div>
      </div>
    </div>
  );
}
