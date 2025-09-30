import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";

// Composants adaptés pour la gestion RH
const EmployeeMetrics = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">Total Employés</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">1,234</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">Entreprises</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">45</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">Bulletins Payés</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">892</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
          <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">Présence Moyenne</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">94%</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
          <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const MonthlyPayrollChart = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Évolution des Salaires</h3>
      <select className="rounded-lg border border-gray-200 px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800">
        <option>Derniers 6 mois</option>
        <option>Dernière année</option>
      </select>
    </div>
    <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="mt-2">Graphique des salaires</p>
      </div>
    </div>
  </div>
);

const DepartmentStats = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Répartition par Département</h3>
    <div className="space-y-4">
      {[
        { name: "Développement", count: 45, percentage: 35 },
        { name: "RH", count: 28, percentage: 22 },
        { name: "Finance", count: 22, percentage: 17 },
        { name: "Marketing", count: 18, percentage: 14 },
        { name: "Support", count: 18, percentage: 12 }
      ].map((dept) => (
        <div key={dept.name} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{dept.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-800 dark:text-white">{dept.count}</span>
            <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${dept.percentage}%` }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RecentActivities = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Activités Récentes</h3>
    <div className="space-y-4">
      {[
        { action: "Nouveau employé ajouté", user: "Marie Dupont", time: "2h", type: "add" },
        { action: "Bulletin de paie généré", user: "Jean Martin", time: "4h", type: "payroll" },
        { action: "Congé approuvé", user: "Pierre Durand", time: "6h", type: "leave" },
        { action: "Évaluation terminée", user: "Sophie Leroy", time: "1j", type: "review" }
      ].map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
            activity.type === 'add' ? 'bg-green-100 dark:bg-green-900' :
            activity.type === 'payroll' ? 'bg-blue-100 dark:bg-blue-900' :
            activity.type === 'leave' ? 'bg-orange-100 dark:bg-orange-900' :
            'bg-purple-100 dark:bg-purple-900'
          }`}>
            <svg className={`h-4 w-4 ${
              activity.type === 'add' ? 'text-green-600 dark:text-green-400' :
              activity.type === 'payroll' ? 'text-blue-600 dark:text-blue-400' :
              activity.type === 'leave' ? 'text-orange-600 dark:text-orange-400' :
              'text-purple-600 dark:text-purple-400'
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                activity.type === 'add' ? "M12 6v6m0 0v6m0-6h6m-6 0H6" :
                activity.type === 'payroll' ? "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" :
                activity.type === 'leave' ? "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" :
                "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              } />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800 dark:text-white">{activity.action}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">par {activity.user} • {activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActions = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Actions Rapides</h3>
    <div className="grid grid-cols-2 gap-3">
      <button className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
        <svg className="mb-2 h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="text-sm font-medium text-gray-800 dark:text-white">Ajouter Employé</span>
      </button>

      <button className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
        <svg className="mb-2 h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        <span className="text-sm font-medium text-gray-800 dark:text-white">Générer Paie</span>
      </button>

      <button className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
        <svg className="mb-2 h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium text-gray-800 dark:text-white">Voir Congés</span>
      </button>

      <button className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
        <svg className="mb-2 h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-medium text-gray-800 dark:text-white">Rapports</span>
      </button>
    </div>
  </div>
);

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <PageMeta
        title="Dashboard RH | Gestion des Employés"
        description="Tableau de bord principal pour la gestion des ressources humaines"
      />

      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Bienvenue, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Rôle: {user?.role} • Vue d'ensemble de votre système de gestion RH
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Metrics */}
        <div className="col-span-12">
          <EmployeeMetrics />
        </div>

        {/* Charts and Stats */}
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <MonthlyPayrollChart />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <DepartmentStats />
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 xl:col-span-4">
          <QuickActions />
        </div>

        {/* Recent Activities */}
        <div className="col-span-12 xl:col-span-8">
          <RecentActivities />
        </div>
      </div>
    </>
  );
}
