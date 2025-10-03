import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaMoneyBillWave, FaCalendarAlt, FaClock, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AttendanceWidget from './AttendanceWidget';
import EmployeeQRCode from './EmployeeQRCode';

interface PaymentInfo {
  amount: number;
  date: string;
}

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPayments: 0,
    lastPayment: null as PaymentInfo | null,
    attendanceRate: 0,
    pendingAbsences: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load basic stats - in a real app, this would come from an API
      setStats({
        totalPayments: 12,
        lastPayment: { amount: 450000, date: '2024-01-15' },
        attendanceRate: 95,
        pendingAbsences: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const quickActions = [
    {
      title: 'Mes Informations',
      description: 'Consultez vos données personnelles',
      icon: FaUser,
      color: 'blue',
      action: () => navigate('/profile')
    },
    {
      title: 'Mes Paiements',
      description: 'Historique de vos bulletins',
      icon: FaMoneyBillWave,
      color: 'green',
      action: () => navigate('/payments')
    },
    {
      title: 'Mes Congés',
      description: 'Demandes et solde de congés',
      icon: FaCalendarAlt,
      color: 'purple',
      action: () => navigate('/leaves')
    },
    {
      title: 'Historique Pointages',
      description: 'Vos heures travaillées',
      icon: FaClock,
      color: 'orange',
      action: () => navigate('/attendance')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👋 Bonjour, {user?.firstName} !
          </h1>
          <p className="text-gray-600">
            Bienvenue dans votre espace employé. Gérez vos pointages et consultez vos informations.
          </p>
        </div>

        {/* Attendance Widget - Primary Feature */}
        <div className="mb-8">
          <AttendanceWidget />
        </div>

        {/* QR Code Widget */}
        <div className="mb-8">
          <EmployeeQRCode />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaMoneyBillWave className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bulletins reçus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaClock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taux présence</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaCalendarAlt className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Congés restants</p>
                <p className="text-2xl font-bold text-gray-900">25j</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaFileAlt className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Demandes en attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAbsences}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all text-left group`}
              >
                <div className={`inline-flex p-3 rounded-lg bg-${action.color}-100 mb-3 group-hover:bg-${action.color}-200 transition-colors`}>
                  <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Activité récente</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <FaClock className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Pointage d'arrivée</p>
                <p className="text-xs text-gray-500">Aujourd'hui à 08:30</p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Présent
              </span>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <FaMoneyBillWave className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Bulletin de salaire reçu</p>
                <p className="text-xs text-gray-500">15 Janvier 2024</p>
              </div>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                450,000 XOF
              </span>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <FaCalendarAlt className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Demande de congé approuvée</p>
                <p className="text-xs text-gray-500">3 jours du 20 au 22 Janvier</p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Approuvé
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;