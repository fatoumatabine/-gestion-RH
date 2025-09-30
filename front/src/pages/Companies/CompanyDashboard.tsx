import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { companiesService, Company } from '../../services/companies';
import { employeesService, Employee } from '../../services/employees';
import { paymentsService, Payment } from '../../services/payments';
import AppSidebar from '../../layout/AppSidebar';
import AppHeader from '../../layout/AppHeader';
import {
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaArrowLeft,
  FaEye,
  FaEdit,
  FaDownload,
  FaSpinner,
  FaChartLine,
  FaCalendarAlt,
  FaCreditCard,
} from 'react-icons/fa';

const CompanyDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = React.useCallback(async () => {
    if (!id || isNaN(parseInt(id))) return;
    try {
      setEmployeesLoading(true);
      const data = await employeesService.getEmployeesByCompany(parseInt(id));
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Erreur lors du chargement des employés');
    } finally {
      setEmployeesLoading(false);
    }
  }, [id]);

  const loadPayments = React.useCallback(async () => {
    if (!id || isNaN(parseInt(id))) return;
    try {
      setPaymentsLoading(true);
      const data = await paymentsService.getPaymentsByCompany(parseInt(id));
      setPayments(data.payments);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Erreur lors du chargement des paiements');
    } finally {
      setPaymentsLoading(false);
    }
  }, [id]);

  const loadCompany = React.useCallback(async () => {
    if (!id || isNaN(parseInt(id))) {
      setError('ID d\'entreprise invalide');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await companiesService.getCompanyById(parseInt(id));
      setCompany(data);
      // Load employees and payments for this company
      await Promise.all([loadEmployees(), loadPayments()]);
    } catch (err) {
      console.error('Error loading company:', err);
      setError('Erreur lors du chargement de l\'entreprise');
    } finally {
      setLoading(false);
    }
  }, [id, loadEmployees, loadPayments]);

  useEffect(() => {
    if (id) {
      loadCompany();
    }
  }, [id, loadCompany]);

  // Les fonctions loadCompany, loadEmployees et loadPayments ont été déplacées plus haut avec useCallback

  const handleDownloadBulletin = async (paymentId: number) => {
    try {
      const blob = await paymentsService.downloadBulletin(paymentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin-${paymentId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement du bulletin:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return 'Traitée';
      case 'PENDING':
        return 'En attente';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <AppSidebar />
        <div className="flex-1 ml-0 lg:ml-20 xl:ml-64">
          <AppHeader />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement du tableau de bord...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <AppSidebar />
        <div className="flex-1 ml-0 lg:ml-20 xl:ml-64">
          <AppHeader />
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">{error || 'Entreprise non trouvée'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Tableau de Bord - ${company.nom} | Système RH`}
        description={`Gestion complète de l'entreprise ${company.nom}`}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <AppSidebar />
        <div className="flex-1 ml-0 lg:ml-20 xl:ml-64">
          <AppHeader />

          <div className="p-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Link
                    to="/companies"
                    className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                  >
                    <FaArrowLeft className="mr-2" />
                    Retour aux entreprises
                  </Link>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <FaBuilding className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {company.nom}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        Tableau de bord de l'entreprise
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    to={`/companies/${company.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <FaEye className="mr-2" />
                    Voir Détails
                  </Link>
                  <Link
                    to={`/companies/${company.id}/edit`}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <FaEdit className="mr-2" />
                    Modifier
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <FaUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employés</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                    <FaMoneyBillWave className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paiements</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <FaCreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paiements Traités</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {payments.filter(p => p.status === 'PROCESSED').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                    <FaChartLine className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salaire Moyen</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {employees.length > 0
                        ? Math.round(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length).toLocaleString()
                        : 'N/A'} {company.devise}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employees Section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <FaUsers className="mr-3 text-blue-600" />
                    Employés ({employees.length})
                  </h2>
                  <Link
                    to={`/employees?company=${company.id}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Voir tous
                  </Link>
                </div>

                {employeesLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <FaSpinner className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Chargement...</span>
                  </div>
                ) : employees.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">Aucun employé trouvé.</p>
                ) : (
                  <div className="space-y-3">
                    {employees.slice(0, 5).map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {emp.user ? `${emp.user.firstName[0]}${emp.user.lastName[0]}` : 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {emp.position || 'N/A'} • {emp.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {emp.salary ? emp.salary.toLocaleString() : 'N/A'} {company.devise}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payments Section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <FaMoneyBillWave className="mr-3 text-green-600" />
                    Derniers Paiements
                  </h2>
                  <Link
                    to={`/payments?company=${company.id}`}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                  >
                    Voir tous
                  </Link>
                </div>

                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <FaSpinner className="animate-spin h-6 w-6 text-green-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Chargement...</span>
                  </div>
                ) : payments.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">Aucun paiement trouvé.</p>
                ) : (
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {payment.employee.user.firstName[0]}{payment.employee.user.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {payment.employee.user.firstName} {payment.employee.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {payment.amount.toLocaleString()} {company.devise}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                              {getStatusText(payment.status)}
                            </span>
                          </div>
                          {payment.status === 'PROCESSED' && (
                            <button
                              onClick={() => handleDownloadBulletin(payment.id)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Télécharger le bulletin"
                            >
                              <FaDownload className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <FaCalendarAlt className="mr-3 text-purple-600" />
                Activité Récente
              </h2>

              <div className="space-y-4">
                {payments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <FaMoneyBillWave className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Paiement traité pour {payment.employee.user.firstName} {payment.employee.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.amount.toLocaleString()} {company.devise} • {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                  </div>
                ))}
                {employees.slice(0, 2).map((emp) => (
                  <div key={`emp-${emp.id}`} className="flex items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <FaUsers className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Employé actif: {emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Poste: {emp.position || 'N/A'} • Statut: {emp.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyDashboard;
