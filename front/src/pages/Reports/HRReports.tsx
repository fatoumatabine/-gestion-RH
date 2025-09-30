import PageMeta from "../../components/common/PageMeta";

export default function HRReports() {
  return (
    <>
      <PageMeta
        title="Rapports RH | Gestion RH"
        description="Rapports et analyses des ressources humaines"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Rapports RH
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analyses et rapports des ressources humaines
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Rapports en développement
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Les rapports RH seront bientôt disponibles.
          </p>
        </div>
      </div>
    </>
  );
}