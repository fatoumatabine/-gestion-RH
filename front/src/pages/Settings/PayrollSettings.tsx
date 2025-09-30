import PageMeta from "../../components/common/PageMeta";

export default function PayrollSettings() {
  return (
    <>
      <PageMeta
        title="Configuration Paie | Gestion RH"
        description="Paramètres de configuration de la paie"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Configuration de la Paie
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Paramètres et règles de calcul de la paie
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Configuration en développement
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Les paramètres de paie seront bientôt disponibles.
          </p>
        </div>
      </div>
    </>
  );
}