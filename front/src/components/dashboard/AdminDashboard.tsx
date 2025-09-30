import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FaBuilding, FaUsers, FaFileAlt, FaArrowUp, FaArrowDown, FaDollarSign, FaBolt, FaBullseye } from 'react-icons/fa';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30days');

  const kpiData = [
    {
      title: 'Total Entreprises',
      value: '25',
      change: '+12%',
      trend: 'up',
      icon: FaBuilding,
      color: 'blue',
      subtitle: 'vs mois dernier'
    },
    {
      title: 'Total Employés',
      value: '1 291',
      change: '+5.2%',
      trend: 'up',
      icon: FaUsers,
      color: 'green',
      subtitle: 'actifs ce mois'
    },
    {
      title: 'Revenus Totaux',
      value: '67 000 FCFA',
      change: '+15.3%',
      trend: 'up',
      icon: FaDollarSign,
      color: 'purple',
      subtitle: 'ce mois'
    },
    {
      title: 'Taux d\'Activité',
      value: '89.2%',
      change: '+3.1%',
      trend: 'up',
      icon: FaBolt,
      color: 'orange',
      subtitle: 'utilisateurs actifs'
    },
    {
      title: 'Paiements',
      value: '575',
      change: '+8.4%',
      trend: 'up',
      icon: FaFileAlt,
      color: 'cyan',
      subtitle: 'transactions'
    },
    {
      title: 'Taux de Rétention',
      value: '94.5%',
      change: '+2.1%',
      trend: 'up',
      icon: FaBullseye,
      color: 'pink',
      subtitle: 'clients fidèles'
    }
  ];

  const monthlyTrend = [
    { month: 'Jan', entreprises: 15, employes: 890, revenus: 45000, paiements: 450 },
    { month: 'Fév', entreprises: 18, employes: 950, revenus: 52000, paiements: 480 },
    { month: 'Mar', entreprises: 20, employes: 1020, revenus: 48000, paiements: 510 },
    { month: 'Avr', entreprises: 22, employes: 1100, revenus: 61000, paiements: 530 },
    { month: 'Mai', entreprises: 23, employes: 1180, revenus: 58000, paiements: 550 },
    { month: 'Juin', entreprises: 25, employes: 1291, revenus: 67000, paiements: 575 }
  ];

  const departmentPerformance = [
    { department: 'IT', performance: 92, satisfaction: 88, productivite: 90 },
    { department: 'RH', performance: 85, satisfaction: 91, productivite: 87 },
    { department: 'Finance', performance: 95, satisfaction: 89, productivite: 93 },
    { department: 'Marketing', performance: 88, satisfaction: 85, productivite: 86 },
    { department: 'Ventes', performance: 90, satisfaction: 92, productivite: 89 }
  ];

  const employeeDistribution = [
    { name: 'Actifs', value: 892, color: '#10b981' },
    { name: 'En Congé', value: 145, color: '#f59e0b' },
    { name: 'Formation', value: 124, color: '#3b82f6' },
    { name: 'Inactifs', value: 130, color: '#ef4444' }
  ];

  const companyTypes = [
    { name: 'Tech', value: 35, color: '#3b82f6' },
    { name: 'Finance', value: 25, color: '#8b5cf6' },
    { name: 'Santé', value: 20, color: '#10b981' },
    { name: 'Éducation', value: 12, color: '#f59e0b' },
    { name: 'Autre', value: 8, color: '#6b7280' }
  ];

  const weeklyActivity = [
    { day: 'Lun', activites: 245 },
    { day: 'Mar', activites: 312 },
    { day: 'Mer', activites: 289 },
    { day: 'Jeu', activites: 356 },
    { day: 'Ven', activites: 298 },
    { day: 'Sam', activites: 156 },
    { day: 'Dim', activites: 98 }
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
              <p className="text-gray-600 mt-1">Analyse complète de vos données</p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
                <option value="year">Cette année</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpiData.map((kpi, index) => {
            const colors = colorMap[kpi.color];
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <kpi.icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{kpi.title}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-gray-900">{kpi.value}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`flex items-center text-sm font-semibold ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.trend === 'up' ? <FaArrowUp className="h-4 w-4 mr-1" /> : <FaArrowDown className="h-4 w-4 mr-1" />}
                        {kpi.change}
                      </span>
                      <span className="text-sm text-gray-500">{kpi.subtitle}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Évolution des Revenus</h3>
              <p className="text-sm text-gray-500 mt-1">Croissance mensuelle en FCFA</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="revenus" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRevenus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-line Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Croissance Multi-indicateurs</h3>
              <p className="text-sm text-gray-500 mt-1">Entreprises, employés et paiements</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="entreprises" stroke="#3b82f6" strokeWidth={2} name="Entreprises" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="employes" stroke="#10b981" strokeWidth={2} name="Employés" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="paiements" stroke="#8b5cf6" strokeWidth={2} name="Paiements" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pie Chart - Employee Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Distribution Employés</h3>
              <p className="text-sm text-gray-500 mt-1">Par statut</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={employeeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {employeeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {employeeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart - Weekly Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Activité Hebdomadaire</h3>
              <p className="text-sm text-gray-500 mt-1">Actions par jour</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="activites" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Company Types */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Types d'Entreprises</h3>
              <p className="text-sm text-gray-500 mt-1">Répartition sectorielle</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={companyTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  label={({ name, percent }) => `${((percent as number) * 100).toFixed(0)}%`}
                >
                  {companyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {companyTypes.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance par Département</h3>
              <p className="text-sm text-gray-500 mt-1">Vue comparative multi-critères</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={departmentPerformance}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="department" style={{ fontSize: '12px' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} style={{ fontSize: '11px' }} />
                <Radar name="Performance" dataKey="performance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Satisfaction" dataKey="satisfaction" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Radar name="Productivité" dataKey="productivite" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Statistiques Rapides</h3>
              <p className="text-sm text-gray-500 mt-1">Aperçu des métriques clés</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Taux de Croissance</span>
                  <span className="text-2xl font-bold text-blue-600">+15.3%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Satisfaction Client</span>
                  <span className="text-2xl font-bold text-green-600">94.5%</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.5%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Taux d'Engagement</span>
                  <span className="text-2xl font-bold text-purple-600">89.2%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '89.2%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Objectif Mensuel</span>
                  <span className="text-2xl font-bold text-orange-600">87.0%</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;