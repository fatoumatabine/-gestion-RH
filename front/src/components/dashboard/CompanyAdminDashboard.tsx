import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { useToast } from '../../context/ToastContext';
import { FaBuilding, FaUsers, FaFileAlt, FaArrowUp, FaDollarSign, FaMoneyBillWave, FaUserPlus, FaEye, FaDownload } from 'react-icons/fa';

interface Employee {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  employeeId: string;
  department: string;
  position: string;
  salary: number;
  status: string;
}

interface Payroll {
  id: number;
  numeroBulletin: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
    employeeId: string;
    department: string;
  };
  salaireBrut: number;
  salaireNet: number;
  statutPaiement: string;
  creeLe: string;
}

const CompanyAdminDashboard = () => {
  const { user } = useAuth();
  const { company, isLoading: companyLoading } = useCompany();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply company colors to CSS variables
  const primaryColor = company?.couleurPrimaire || '#3b82f6';
  const secondaryColor = company?.couleurSecondaire || '#10b981';

  useEffect(() => {
    if (company) {
      loadCompanyData();

      // Apply company colors to CSS variables for consistent theming
      if (company.couleurPrimaire) {
        document.documentElement.style.setProperty('--color-primary', company.couleurPrimaire);
      }
      if (company.couleurSecondaire) {
        document.documentElement.style.setProperty('--color-secondary', company.couleurSecondaire);
      }
      if (company.couleurDashboard) {
        document.documentElement.style.setProperty('--color-dashboard', company.couleurDashboard);
      }
    }
  }, [company]);

  const loadCompanyData = async () => {
    if (!company) return;

    try {
      setLoading(true);

      // Load employees
      const employeesResponse = await fetch(`http://localhost:5000/api/employees/company/${company.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);
      }

      // Load payrolls for this company only
      const payrollsResponse = await fetch(`http://localhost:5000/api/payrolls/company/${company.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (payrollsResponse.ok) {
        const payrollsData = await payrollsResponse.json();
        setPayrolls(payrollsData.bulletins || payrollsData || []);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Erreur', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCashier = () => {
    navigate('/employees/new');
  };

  const handleViewPayroll = (payroll: Payroll) => {
    navigate(`/payrolls/${payroll.id}`);
  };

  const handleDownloadPayroll = async (payroll: Payroll) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payrolls/${payroll.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${payroll.numeroBulletin}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showSuccess('Téléchargement réussi', 'Le bulletin a été téléchargé');
      } else if (response.status === 404) {
        showError('PDF non disponible', 'Le PDF n\'a pas encore été généré');
      } else {
        showError('Erreur', 'Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur', 'Erreur lors du téléchargement');
    }
  };

  if (companyLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FaBuilding className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Entreprise non trouvée</h3>
          <p className="text-gray-600">Vous n'êtes pas associé à une entreprise.</p>
        </div>
      </div>
    );
  }


  // Calculate real statistics
  const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE');
  const totalSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const averageSalary = employees.length > 0 ? Math.round(totalSalary / employees.length) : 0;
  const activityRate = employees.length > 0 ? Math.round((activeEmployees.length / employees.length) * 100) : 0;

  // Calculate payroll statistics
  const paidPayrolls = payrolls.filter(p => p.statutPaiement === 'PAYE');
  const totalPayrollAmount = payrolls.reduce((sum, p) => sum + (p.salaireNet || 0), 0);

  const kpiData = [
    {
      title: 'Employés actifs',
      value: activeEmployees.length.toString(),
      change: employees.length > 0 ? `${Math.round((activeEmployees.length / employees.length) * 100)}% du total` : '0%',
      trend: 'up',
      icon: FaUsers,
      color: 'green'
    },
    {
      title: 'Bulletins générés',
      value: payrolls.length.toString(),
      change: `${paidPayrolls.length} payés`,
      trend: 'up',
      icon: FaFileAlt,
      color: 'blue'
    },
    {
      title: 'Salaire moyen',
      value: `${averageSalary.toLocaleString()} ${company.devise}`,
      change: `Total: ${totalSalary.toLocaleString()} ${company.devise}`,
      trend: 'up',
      icon: FaDollarSign,
      color: 'purple'
    },
    {
      title: 'Masse salariale',
      value: `${totalPayrollAmount.toLocaleString()} ${company.devise}`,
      change: `${payrolls.length} bulletins ce mois`,
      trend: 'up',
      icon: FaMoneyBillWave,
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Company Info */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {company.logo && (
                <img
                  src={company.logo}
                  alt="Logo entreprise"
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.nom}</h1>
                <p className="text-gray-600 mt-1">Dashboard Administrateur • {company.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/companies/${company.id}/edit`)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                style={{ backgroundColor: secondaryColor }}
              >
                <FaBuilding className="mr-2" />
                Personnaliser Entreprise
              </button>
              <button
                onClick={handleAddCashier}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <FaUserPlus className="mr-2" />
                Ajouter Caissier
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <kpi.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{kpi.title}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center text-sm font-semibold text-green-600">
                      <FaArrowUp className="h-4 w-4 mr-1" />
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500">vs mois dernier</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Statistics Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques détaillées</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
              <div className="text-sm text-gray-600">Total employés</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeEmployees.length}</div>
              <div className="text-sm text-gray-600">Employés actifs</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{payrolls.length}</div>
              <div className="text-sm text-gray-600">Bulletins générés</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{paidPayrolls.length}</div>
              <div className="text-sm text-gray-600">Bulletins payés</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Employees List */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Employés ({employees.length})</h3>
                <p className="text-sm text-gray-500 mt-1">Gestion des employés de l'entreprise</p>
              </div>
              <button
                onClick={() => navigate('/employees')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir tous
              </button>
            </div>
            <div className="space-y-4">
              {employees.slice(0, 5).map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {employee.user.firstName[0]}{employee.user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {employee.user.firstName} {employee.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {employee.employeeId} • {employee.department || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {employee.salary?.toLocaleString()} {company.devise}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      employee.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
              {employees.length === 0 && (
                <div className="text-center py-8">
                  <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun employé trouvé</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payrolls */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bulletins récents</h3>
                <p className="text-sm text-gray-500 mt-1">Derniers bulletins générés</p>
              </div>
              <button
                onClick={() => navigate('/payrolls')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir tous
              </button>
            </div>
            <div className="space-y-4">
              {payrolls.slice(0, 5).map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaFileAlt className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {payroll.numeroBulletin}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payroll.employee.user.firstName} {payroll.employee.user.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      payroll.statutPaiement === 'PAYE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payroll.statutPaiement === 'PAYE' ? 'Payé' : 'En attente'}
                    </span>
                    <button
                      onClick={() => handleViewPayroll(payroll)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir détails"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadPayroll(payroll)}
                      className="text-green-600 hover:text-green-800"
                      title="Télécharger PDF"
                    >
                      <FaDownload className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {payrolls.length === 0 && (
                <div className="text-center py-8">
                  <FaFileAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun bulletin trouvé</p>
                  <button
                    onClick={() => navigate('/payrolls/new')}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Générer des bulletins
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/employees/new')}
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              style={{ backgroundColor: `${primaryColor}20`, borderColor: primaryColor }}
            >
              <FaUserPlus className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
              <span className="font-medium" style={{ color: primaryColor }}>Ajouter Employé</span>
            </button>
            <button
              onClick={() => navigate('/payrolls/new')}
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              style={{ backgroundColor: `${secondaryColor}20`, borderColor: secondaryColor }}
            >
              <FaFileAlt className="h-6 w-6 mr-3" style={{ color: secondaryColor }} />
              <span className="font-medium" style={{ color: secondaryColor }}>Générer Paie</span>
            </button>
            <button
              onClick={() => navigate('/companies')}
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <FaBuilding className="h-6 w-6 mr-3 text-purple-600" />
              <span className="font-medium text-purple-600">Gérer Entreprise</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAdminDashboard;