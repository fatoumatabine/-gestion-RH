import PageMeta from "../../components/common/PageMeta";

export default function LeaveRequests() {
  return (
    <>
      <PageMeta
        title="Demandes de Congé | Gestion RH"
        description="Gérez les demandes de congé des employés"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Demandes de Congé
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez toutes les demandes de congé
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Module en développement
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            La gestion des congés sera bientôt disponible.
          </p>
        </div>
      </div>
    </>
  );
}