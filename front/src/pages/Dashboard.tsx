import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService, DashboardStats, EmployeeDistribution, SalaryEvolution } from '../services/dashboard';
import PageMeta from '../components/common/PageMeta';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  FaUser,
  FaBuilding,
  FaUsers,
  FaChartLine,
  FaFileInvoice,
  FaCalendarCheck,
  FaShoppingCart,
  FaChartBar,
  FaCashRegister,
  FaIdCard,
  FaWallet,
  FaCalendarAlt,
  FaCrown,
  FaCog,
  FaMoneyBillWave,
  FaStar,
  FaUserFriends,
  FaBolt,
  FaArrowRight
} from 'react-icons/fa';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [employeeDistribution, setEmployeeDistribution] = useState<EmployeeDistribution[]>([]);
  const [salaryEvolution, setSalaryEvolution] = useState<SalaryEvolution[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsData, employeeData, salaryData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getEmployeeDistribution(),
        dashboardService.getSalaryEvolution()
      ]);

      setStats(statsData);
      setEmployeeDistribution(employeeData);
      setSalaryEvolution(salaryData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleActionClick = useCallback((actionTitle: string) => {
    if (!user) return;

    switch (actionTitle) {
      case 'Gestion Entreprises':
        navigate('/companies');
        break;
      case 'Administration Users':
        navigate('/admin/users');
        break;
      case 'Rapports Système':
        navigate('/analytics/dashboard');
        break;
      case 'Gestion Employés':
        navigate('/employees');
        break;
      case 'Paie & Salaires':
        navigate('/payrolls');
        break;
      case 'Facturation':
        navigate('/invoices');
        break;
      case 'Point de Vente':
        navigate('/pos');
        break;
      case 'Historique Ventes':
        navigate('/sales');
        break;
      case 'Gestion Caisse':
        navigate('/cash-management');
        break;
      case 'Mon Profil':
        navigate('/profile');
        break;
      case 'Mes Bulletins':
        navigate('/salaries');
        break;
      case 'Demandes Congés':
        navigate('/leaves');
        break;
      default:
        console.log(`Action non gérée: ${actionTitle}`);
    }
  }, [navigate, user]);



  const getRoleConfig = () => {
    switch (user?.role) {
      case 'SUPERADMIN':
        return {
          title: 'Super Administrateur',
          titleIcon: <FaCrown className="inline mr-2" />,
          subtitle: 'Contrôle Total du Système',
          primaryColor: 'bg-indigo-600',
          secondaryColor: 'bg-indigo-500',
          accentColor: 'bg-indigo-100',
          textAccent: 'text-indigo-600',
          stats: [
            { label: 'Entreprises Actives', value: '12', change: '+2', icon: <FaBuilding />, bgColor: 'bg-blue-500', textColor: 'text-blue-600' },
            { label: 'Utilisateurs Totaux', value: '156', change: '+12', icon: <FaUsers />, bgColor: 'bg-green-500', textColor: 'text-green-600' },
            { label: 'Sessions Aujourd\'hui', value: '89', change: '+15%', icon: <FaChartLine />, bgColor: 'bg-purple-500', textColor: 'text-purple-600' },
            { label: 'Taux Satisfaction', value: '98%', change: '+2%', icon: <FaStar />, bgColor: 'bg-yellow-500', textColor: 'text-yellow-600' },
          ],
          actions: [
            { title: 'Gestion Entreprises', desc: 'CRUD complet', icon: <FaBuilding />, bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
            { title: 'Administration Users', desc: 'Contrôle global', icon: <FaCrown />, bgColor: 'bg-indigo-500', hoverColor: 'hover:bg-indigo-600' },
            { title: 'Rapports Système', desc: 'Analytics complets', icon: <FaChartBar />, bgColor: 'bg-teal-500', hoverColor: 'hover:bg-teal-600' },
          ]
        };
      case 'ADMIN':
        return {
          title: 'Administrateur',
          titleIcon: <FaCog className="inline mr-2" />,
          subtitle: 'Gestion d\'Entreprise',
          primaryColor: 'bg-blue-600',
          secondaryColor: 'bg-blue-500',
          accentColor: 'bg-blue-100',
          textAccent: 'text-blue-600',
          stats: [
            { label: 'Employés Actifs', value: '24', change: '+3', icon: <FaUserFriends />, bgColor: 'bg-blue-500', textColor: 'text-blue-600' },
            { label: 'Bulletins Générés', value: '156', change: '+8', icon: <FaFileInvoice />, bgColor: 'bg-green-500', textColor: 'text-green-600' },
            { label: 'Congés Approuvés', value: '23', change: '+5', icon: <FaCalendarCheck />, bgColor: 'bg-orange-500', textColor: 'text-orange-600' },
            { label: 'Productivité', value: '94%', change: '+6%', icon: <FaBolt />, bgColor: 'bg-purple-500', textColor: 'text-purple-600' },
          ],
          actions: [
            { title: 'Gestion Employés', desc: 'CRUD employés', icon: <FaUserFriends />, bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
            { title: 'Paie & Salaires', desc: 'Bulletins & calculs', icon: <FaWallet />, bgColor: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
            { title: 'Facturation', desc: 'Gestion factures', icon: <FaFileInvoice />, bgColor: 'bg-orange-500', hoverColor: 'hover:bg-orange-600' },
          ]
        };
      case 'CASHIER':
        return {
          title: 'Caissier',
          titleIcon: <FaMoneyBillWave className="inline mr-2" />,
          subtitle: 'Point de Vente & Transactions',
          primaryColor: 'bg-green-600',
          secondaryColor: 'bg-green-500',
          accentColor: 'bg-green-100',
          textAccent: 'text-green-600',
          stats: [
            { label: 'Transactions Aujourd\'hui', value: '1,247', change: '+18%', icon: <FaMoneyBillWave />, bgColor: 'bg-green-500', textColor: 'text-green-600' },
            { label: 'Paiements Validés', value: '892', change: '+12', icon: <FaCashRegister />, bgColor: 'bg-blue-500', textColor: 'text-blue-600' },
            { label: 'Temps Moyen', value: '< 2min', change: '-15%', icon: <FaBolt />, bgColor: 'bg-yellow-500', textColor: 'text-yellow-600' },
            { label: 'Satisfaction Client', value: '96%', change: '+3%', icon: <FaStar />, bgColor: 'bg-pink-500', textColor: 'text-pink-600' },
          ],
          actions: [
            { title: 'Point de Vente', desc: 'Transactions clients', icon: <FaShoppingCart />, bgColor: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
            { title: 'Historique Ventes', desc: 'Rapports détaillés', icon: <FaChartBar />, bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
            { title: 'Gestion Caisse', desc: 'Clôture & inventaire', icon: <FaCashRegister />, bgColor: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
          ]
        };
      default:
        return {
          title: 'Employé',
          titleIcon: <FaUser className="inline mr-2" />,
          subtitle: 'Mon Espace Personnel',
          primaryColor: 'bg-slate-600',
          secondaryColor: 'bg-slate-500',
          accentColor: 'bg-slate-100',
          textAccent: 'text-slate-600',
          stats: [
            { label: 'Jours Présents', value: '22/25', change: '+2', icon: <FaCalendarAlt />, bgColor: 'bg-green-500', textColor: 'text-green-600' },
            { label: 'Bulletins Disponibles', value: '3', change: '+1', icon: <FaFileInvoice />, bgColor: 'bg-blue-500', textColor: 'text-blue-600' },
            { label: 'Solde Congés', value: '15j', change: '0', icon: <FaCalendarCheck />, bgColor: 'bg-orange-500', textColor: 'text-orange-600' },
            { label: 'Performance', value: '87%', change: '+5%', icon: <FaChartLine />, bgColor: 'bg-purple-500', textColor: 'text-purple-600' },
          ],
          actions: [
            { title: 'Mon Profil', desc: 'Informations personnelles', icon: <FaIdCard />, bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
            { title: 'Mes Bulletins', desc: 'Historique paie', icon: <FaWallet />, bgColor: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
            { title: 'Demandes Congés', desc: 'Gestion absences', icon: <FaCalendarAlt />, bgColor: 'bg-orange-500', hoverColor: 'hover:bg-orange-600' },
          ]
        };
    }
  };

  const config = getRoleConfig();


  return (
    <>
      <PageMeta
        title={`${config.title} | Gestion RH`}
        description="Tableau de bord personnalisé selon votre rôle"
      />

      <div className="min-h-screen relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundAttachment: 'fixed'
      }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>

        {/* Compact Welcome Section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <FaCrown className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-white/70 text-sm">Super Administrateur</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70 text-xs">Système OK</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white text-sm">
                    {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-white/50 text-xs">
                    {new Date().toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Statistics Cards */}
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="group relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-slate-700/50 hover:-translate-y-2 hover:scale-105">
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm ${
                      stat.change.startsWith('+') ? 'bg-green-100/80 text-green-800 dark:bg-green-900/40 dark:text-green-400' :
                      stat.change.startsWith('-') ? 'bg-red-100/80 text-red-800 dark:bg-red-900/40 dark:text-red-400' :
                      'bg-blue-100/80 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400'
                    }`}>
                      {stat.change}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full ${stat.bgColor} rounded-full transition-all duration-1000 ease-out`}
                        style={{
                          width: `${Math.min(Math.max(
                            parseInt(stat.value?.toString().replace(/[^\d]/g, '') || '75') || 75,
                            10
                          ), 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Combined Actions & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Quick Actions */}
            <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Actions Rapides</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70 text-xs">Actif</span>
                </div>
              </div>
              <div className="space-y-2">
                {getRoleConfig().actions.slice(0, 3).map((action, index) => (
                  <button
                    key={index}
                    className="w-full group relative overflow-hidden bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all duration-300"
                    onClick={() => handleActionClick(action.title)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg ${action.bgColor} flex items-center justify-center shadow-lg text-white`}>
                        {action.icon}
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="text-white font-medium text-sm">
                          {action.title}
                        </h4>
                        <p className="text-white/60 text-xs">
                          {action.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">État Système</h3>
                <button className="relative p-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-300">
                  <FaBolt className="text-yellow-400 text-sm" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs">Serveur</span>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-white font-semibold text-sm">99.9%</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs">Base</span>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-white font-semibold text-sm">OK</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs">API</span>
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-white font-semibold text-sm">120ms</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs">Users</span>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-white font-semibold text-sm">1.2k</div>
                </div>
              </div>
            </div>

            {/* Action Cards Compact */}
            <div className="space-y-3">
              {config.actions.map((action, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-slate-700/50 hover:-translate-y-1 hover:scale-105 cursor-pointer"
                  onClick={() => handleActionClick(action.title)}
                >
                  <div className="relative p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl ${action.bgColor} flex items-center justify-center shadow-lg text-white`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {action.desc}
                        </p>
                      </div>
                      <FaArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Employee Distribution Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Répartition Employés
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Par département
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <FaUsers className="text-white text-sm" />
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={employeeDistribution.length > 0 ? employeeDistribution : [
                    { name: 'Dev', employés: 12, couleur: '#3B82F6' },
                    { name: 'RH', employés: 8, couleur: '#10B981' },
                    { name: 'Finance', employés: 6, couleur: '#F59E0B' },
                    { name: 'Marketing', employés: 5, couleur: '#EF4444' },
                    { name: 'Support', employés: 4, couleur: '#8B5CF6' },
                  ]}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tick={{ fill: '#6B7280' }} />
                  <YAxis stroke="#6B7280" fontSize={10} tick={{ fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F9FAFB',
                      border: 'none',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="employés" radius={[2, 2, 0, 0]} animationDuration={1000}>
                    {(employeeDistribution.length > 0 ? employeeDistribution : [
                      { couleur: '#3B82F6' },
                      { couleur: '#10B981' },
                      { couleur: '#F59E0B' },
                      { couleur: '#EF4444' },
                      { couleur: '#8B5CF6' },
                    ]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.couleur} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Salary Evolution Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Évolution Salaires
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Moyenne par trimestre
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <FaChartLine className="text-white text-sm" />
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={salaryEvolution.length > 0 ? salaryEvolution : [
                    { trimestre: 'Q1', salaire: 650 },
                    { trimestre: 'Q2', salaire: 675 },
                    { trimestre: 'Q3', salaire: 690 },
                    { trimestre: 'Q4', salaire: 710 },
                    { trimestre: 'Q1', salaire: 735 },
                    { trimestre: 'Q2', salaire: 750 },
                  ]}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="trimestre" stroke="#6B7280" fontSize={10} tick={{ fill: '#6B7280' }} />
                  <YAxis stroke="#6B7280" fontSize={10} tick={{ fill: '#6B7280' }} tickFormatter={(value) => `${value}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F9FAFB',
                      border: 'none',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}k FCFA`, 'Salaire Moyen']}
                  />
                  <Area
                    type="monotone"
                    dataKey="salaire"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSalary)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;