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

  // Color utility functions
  const getPrimaryColor = () => company?.couleurPrimaire || '#3b82f6';
  const getSecondaryColor = () => company?.couleurSecondaire || '#10b981';
  const getDashboardColor = () => company?.couleurDashboard || '#1f2937';

  // Helper function to create gradient from company colors
  const getGradientStyle = (fromColor: string, toColor: string) => ({
    background: `linear-gradient(135deg, ${fromColor}, ${toColor})`
  });

  // Helper function to create lighter shade for hover effects
  const lightenColor = (color: string, percent: number) => {
    // Simple color lightening - in a real app you'd use a proper color library
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const loadEmployees = React.useCallback(async () => {
    if (!id || isNaN(parseInt(id))) return;
    try {
      setEmployeesLoading(true);
      const data: unknown = await employeesService.getEmployeesByCompany(parseInt(id));
      console.log('Employees API response:', data); // Debug log

      // Handle different response formats
      let employeesArray: Employee[] = [];
      if (Array.isArray(data)) {
        employeesArray = data;
      } else if (data && Array.isArray((data as any).employees)) { // eslint-disable-line @typescript-eslint/no-explicit-any
        employeesArray = (data as any).employees; // eslint-disable-line @typescript-eslint/no-explicit-any
      } else if (data && Array.isArray((data as any).data)) { // eslint-disable-line @typescript-eslint/no-explicit-any
        employeesArray = (data as any).data; // eslint-disable-line @typescript-eslint/no-explicit-any
      } else {
        console.warn('Unexpected employees API response format:', data);
        employeesArray = [];
      }

      // Ensure we always have an array
      if (!Array.isArray(employeesArray)) {
        console.error('Employees data is not an array:', employeesArray);
        employeesArray = [];
      }

      setEmployees(employeesArray);
    } catch (err) {
      console.error('Error loading employees:', err);
      // Don't set error for employees, just log it
      setEmployees([]);
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
      // Don't set error for payments, just log it
      setPayments([]);
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
            <div className="relative rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden" style={getGradientStyle(getPrimaryColor(), getSecondaryColor())}>
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black bg-opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <Link
                      to="/companies"
                      className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium rounded-xl transition-all duration-200 backdrop-blur-sm"
                    >
                      <FaArrowLeft className="mr-2" />
                      Retour aux entreprises
                    </Link>
                    <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="flex-shrink-0 h-16 w-16">
                        {company.logo ? (
                          <img
                            src={`http://localhost:5000${company.logo}`}
                            alt={`${company.nom} logo`}
                            className="h-16 w-16 rounded-xl object-cover shadow-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-white to-gray-100 flex items-center justify-center shadow-lg">
                            <FaBuilding className="h-8 w-8 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-6">
                        <h1 className="text-3xl font-bold text-white mb-1">
                          {company.nom}
                        </h1>
                        <p className="text-blue-100 text-lg">
                          Tableau de bord de l'entreprise
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 bg-opacity-20 text-green-100">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            {company.estActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link
                      to={`/companies/${company.id}`}
                      className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm hover:scale-105"
                    >
                      <FaEye className="mr-2" />
                      Voir Détails
                    </Link>
                    <Link
                      to={`/companies/${company.id}/edit`}
                      className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                      style={getGradientStyle(getSecondaryColor(), lightenColor(getSecondaryColor(), 20))}
                    >
                      <FaEdit className="mr-2" />
                      Modifier
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="group rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer" style={getGradientStyle(getPrimaryColor(), lightenColor(getPrimaryColor(), 20))}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-80 text-sm font-medium mb-1">Employés</p>
                    <p className="text-3xl font-bold text-white">{(employees || []).length}</p>
                    <p className="text-white text-opacity-70 text-xs mt-1">Total actifs</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <FaUsers className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer" style={getGradientStyle(getSecondaryColor(), lightenColor(getSecondaryColor(), 20))}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-80 text-sm font-medium mb-1">Paiements</p>
                    <p className="text-3xl font-bold text-white">{payments.length}</p>
                    <p className="text-white text-opacity-70 text-xs mt-1">Ce mois</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <FaMoneyBillWave className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer" style={getGradientStyle(getPrimaryColor(), getSecondaryColor())}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-80 text-sm font-medium mb-1">Paiements Traités</p>
                    <p className="text-3xl font-bold text-white">
                      {payments.filter(p => p.status === 'PROCESSED').length}
                    </p>
                    <p className="text-white text-opacity-70 text-xs mt-1">Validés</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <FaCreditCard className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full transition-all duration-500" style={{
                      width: payments.length > 0 ? `${Math.round((payments.filter(p => p.status === 'PROCESSED').length / payments.length) * 100)}%` : '0%'
                    }}></div>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer" style={getGradientStyle(lightenColor(getPrimaryColor(), 30), lightenColor(getSecondaryColor(), 30))}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-80 text-sm font-medium mb-1">Salaire Moyen</p>
                    <p className="text-3xl font-bold text-white">
                      {(employees || []).length > 0
                        ? Math.round((employees || []).reduce((sum, emp) => sum + (emp.salary || 0), 0) / (employees || []).length).toLocaleString()
                        : 'N/A'}
                    </p>
                    <p className="text-white text-opacity-70 text-xs mt-1">{company.devise}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <FaChartLine className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Employees Section */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300" style={{borderLeft: `4px solid ${getPrimaryColor()}`}}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-2xl mr-4" style={getGradientStyle(getPrimaryColor(), lightenColor(getPrimaryColor(), 20))}>
                      <FaUsers className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Employés
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {(employees || []).length} employé{(employees || []).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/employees?company=${company.id}`}
                    className="inline-flex items-center px-4 py-2 font-medium rounded-xl transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: `${getPrimaryColor()}20`,
                      color: getPrimaryColor()
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${getPrimaryColor()}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${getPrimaryColor()}20`;
                    }}
                  >
                    Voir tous
                    <FaEye className="ml-2 h-4 w-4" />
                  </Link>
                </div>

                {employeesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mr-3" />
                    <span className="text-gray-600 dark:text-gray-400 text-lg">Chargement...</span>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700 inline-block mb-4">
                      <FaUsers className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Aucun employé trouvé.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(employees || []).slice(0, 5).map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-sm">
                                {emp.user ? `${emp.user.firstName[0]}${emp.user.lastName[0]}` : 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                              {emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {emp.position || 'N/A'} • {emp.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {emp.salary ? emp.salary.toLocaleString() : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{company.devise}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payments Section */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300" style={{borderLeft: `4px solid ${getSecondaryColor()}`}}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-2xl mr-4" style={getGradientStyle(getSecondaryColor(), lightenColor(getSecondaryColor(), 20))}>
                      <FaMoneyBillWave className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Derniers Paiements
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {payments.length} paiement{payments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/payments?company=${company.id}`}
                    className="inline-flex items-center px-4 py-2 font-medium rounded-xl transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: `${getSecondaryColor()}20`,
                      color: getSecondaryColor()
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${getSecondaryColor()}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${getSecondaryColor()}20`;
                    }}
                  >
                    Voir tous
                    <FaEye className="ml-2 h-4 w-4" />
                  </Link>
                </div>

                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <FaSpinner className="animate-spin h-8 w-8 text-green-600 mr-3" />
                    <span className="text-gray-600 dark:text-gray-400 text-lg">Chargement...</span>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700 inline-block mb-4">
                      <FaMoneyBillWave className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Aucun paiement trouvé.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-sm">
                                {payment.employee.user.firstName[0]}{payment.employee.user.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                              {payment.employee.user.firstName} {payment.employee.user.lastName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {payment.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{company.devise}</p>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                          {payment.status === 'PROCESSED' && (
                            <button
                              onClick={() => handleDownloadBulletin(payment.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all duration-200 hover:scale-110"
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
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300" style={{borderLeft: `4px solid ${getPrimaryColor()}`}}>
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-2xl mr-4" style={getGradientStyle(getPrimaryColor(), getSecondaryColor())}>
                  <FaCalendarAlt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Activité Récente
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Dernières actions et événements
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {payments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <FaMoneyBillWave className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        Paiement traité pour {payment.employee.user.firstName} {payment.employee.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {payment.amount.toLocaleString()} {company.devise} • {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                  </div>
                ))}
                {(employees || []).slice(0, 2).map((emp) => (
                  <div key={`emp-${emp.id}`} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                        <FaUsers className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        Employé actif: {emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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
