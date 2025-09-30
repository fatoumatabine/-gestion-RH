import PageMeta from "../../components/common/PageMeta";

export default function TemplateSettings() {
  return (
    <>
      <PageMeta
        title="Modèles de Documents | Gestion RH"
        description="Gestion des modèles de documents RH"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Modèles de Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Créer et gérer les modèles de documents RH
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Modèles en développement
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            La gestion des modèles de documents sera bientôt disponible.
          </p>
        </div>
      </div>
    </>
  );
}