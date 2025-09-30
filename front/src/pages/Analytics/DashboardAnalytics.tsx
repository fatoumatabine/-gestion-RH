import PageMeta from "../../components/common/PageMeta";

export default function DashboardAnalytics() {
  return (
    <>
      <PageMeta
        title="Tableaux de Bord Analytiques | Gestion RH"
        description="Tableaux de bord et analyses avancées"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Tableaux de Bord Analytiques
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analyses avancées et insights RH
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Analyses en développement
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Les tableaux de bord analytiques seront bientôt disponibles.
          </p>
        </div>
      </div>
    </>
  );
}