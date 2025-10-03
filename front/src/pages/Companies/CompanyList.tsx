import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { companiesService, Company } from '../../services/companies';
import { employeesService } from '../../services/employees';
import { usersService } from '../../services/users';
import { useToast } from '../../context/ToastContext';
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaTimes,
} from 'react-icons/fa';

const CompanyList: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'CASHIER',
    department: '',
    position: '',
    salary: ''
  });
  const [creatingEmployee, setCreatingEmployee] = useState(false);


  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data: unknown = await companiesService.getAllCompanies();
      console.log('API response:', data); // Debug log

      // Handle different response formats
      let companiesArray: Company[] = [];
      if (Array.isArray(data)) {
        companiesArray = data as Company[];
      } else if (data && Array.isArray((data as any).companies)) { // eslint-disable-line @typescript-eslint/no-explicit-any
        companiesArray = (data as any).companies; // eslint-disable-line @typescript-eslint/no-explicit-any
      } else if (data && Array.isArray((data as any).data)) { // eslint-disable-line @typescript-eslint/no-explicit-any
        companiesArray = (data as any).data; // eslint-disable-line @typescript-eslint/no-explicit-any
      } else {
        console.warn('Unexpected API response format:', data);
        companiesArray = [];
      }

      setCompanies(companiesArray);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des entreprises');
      console.error('Error loading companies:', err);
      setCompanies([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (companyId: number) => {
    try {
      await companiesService.toggleCompanyStatus(companyId);
      await loadCompanies(); // Recharger la liste
    } catch (err) {
      console.error('Error toggling company status:', err);
      setError('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (companyId: number, companyName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise "${companyName}" ? Cette action est irréversible.`)) {
      try {
        await companiesService.deleteCompany(companyId);
        await loadCompanies(); // Recharger la liste
      } catch (err) {
        console.error('Error deleting company:', err);
        setError('Erreur lors de la suppression de l\'entreprise');
      }
    }
  };

  const handleOpenAddEmployeeModal = (company: Company) => {
    setSelectedCompany(company);
    setShowAddEmployeeModal(true);
  };

  const handleCloseAddEmployeeModal = () => {
    setShowAddEmployeeModal(false);
    setSelectedCompany(null);
    setEmployeeForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'CASHIER',
      department: '',
      position: '',
      salary: ''
    });
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setCreatingEmployee(true);
    try {
      // Créer d'abord l'utilisateur
      const user = await usersService.createUser({
        email: employeeForm.email,
        password: employeeForm.password,
        firstName: employeeForm.firstName,
        lastName: employeeForm.lastName,
        role: employeeForm.role,
        phone: employeeForm.phone
      });

      // Créer ensuite l'employé
      await employeesService.createEmployee({
        userId: user.id,
        entrepriseId: selectedCompany.id,
        department: employeeForm.department,
        position: employeeForm.position,
        salary: parseFloat(employeeForm.salary) || 0,
        phone: employeeForm.phone
      });

      showSuccess('Employé créé avec succès');
      handleCloseAddEmployeeModal();
      await loadCompanies(); // Recharger la liste pour mettre à jour les statistiques
    } catch (err) {
      console.error('Error creating employee:', err);
      showError('Erreur lors de la création de l\'employé');
    } finally {
      setCreatingEmployee(false);
    }
  };


  const filteredCompanies = (companies || []).filter(company => {
    const matchesSearch = company.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'active' && company.estActive) ||
                          (statusFilter === 'inactive' && !company.estActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des entreprises...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Gestion des Entreprises | Système RH"
        description="Gérer les entreprises du système"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FaBuilding className="mr-3 text-blue-600" />
                  Gestion des Entreprises
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gérez les entreprises et leurs paramètres
                </p>
              </div>
              <Link
                to="/companies/add"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <FaPlus className="mr-2" />
                Nouvelle Entreprise
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaTrash className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <FaFilter className="mr-2 text-gray-600 dark:text-gray-400" />
                Filtres
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Statut
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="active">Actives</option>
                      <option value="inactive">Inactives</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Companies Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Aucune entreprise trouvée
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Essayez de modifier vos critères de recherche.'
                    : 'Commencez par créer votre première entreprise.'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <div className="mt-6">
                    <Link
                      to="/companies/add"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      Créer la première entreprise
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Entreprise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Employés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
<div className="flex-shrink-0 h-10 w-10">
  {company.logo ? (
    <img
      src={`http://localhost:5000${company.logo}`}
      alt={`${company.nom} logo`}
      className="h-10 w-10 rounded-lg object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = '';
      }}
    />
  ) : (
    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
      <FaBuilding className="h-5 w-5 text-white" />
    </div>
  )}
</div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {company.nom}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {company.devise} • {company.periodePayroll}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {company.email || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {company.telephone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaUsers className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {company.nombreEmployes} ({company.employesActifs} actifs)
                            </span>
                          </div>
                          {company.salaireMoyen && (
                            <div className="flex items-center mt-1">
                              <FaMoneyBillWave className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Moy: {company.salaireMoyen.toLocaleString()} {company.devise}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            company.estActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {company.estActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/companies/${company.id}/dashboard`}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Tableau de bord"
                            >
                              <FaBuilding className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/companies/${company.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Voir les détails"
                            >
                              <FaEye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/companies/${company.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Modifier"
                            >
                              <FaEdit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(company.id)}
                              className={`${
                                company.estActive
                                  ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                                  : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                              }`}
                              title={company.estActive ? 'Désactiver' : 'Activer'}
                            >
                              {company.estActive ? <FaToggleOff className="h-4 w-4" /> : <FaToggleOn className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleOpenAddEmployeeModal(company)}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                              title="Ajouter un employé"
                            >
                              <FaUserPlus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(company.id, company.nom)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Supprimer"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <FaBuilding className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entreprises</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{(companies || []).length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <FaToggleOn className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Entreprises Actives</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(companies || []).filter(c => c.estActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <FaUsers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employés</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(companies || []).reduce((sum, c) => sum + c.nombreEmployes, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                  <FaMoneyBillWave className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salaire Moyen</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(() => {
                      const companiesArray = companies || [];
                      if (companiesArray.length === 0) return '0 FCFA';
                      const average = companiesArray.reduce((sum, c) => sum + (c.salaireMoyen || 0), 0) / companiesArray.length;
                      return isNaN(average) ? '0 FCFA' : Math.round(average).toLocaleString() + ' FCFA';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
            {/* Header with gradient background */}
            <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 p-8 text-white">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <FaUserPlus className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Ajouter un employé</h1>
                    <p className="text-purple-100 mt-1">à {selectedCompany?.nom}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseAddEmployeeModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
              <form onSubmit={handleCreateEmployee} className="space-y-8">
                {/* Personal Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 border border-blue-100 dark:border-slate-600">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Informations personnelles
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={employeeForm.firstName}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-blue-300"
                          placeholder="Ex: Jean"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={employeeForm.lastName}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-blue-300"
                          placeholder="Ex: Dupont"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={employeeForm.email}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-blue-300"
                          placeholder="exemple@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Téléphone
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={employeeForm.phone}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-blue-300"
                          placeholder="+221 77 123 45 67"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 border border-green-100 dark:border-slate-600">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Informations de compte
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mot de passe <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={employeeForm.password}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-green-300"
                          placeholder="Mot de passe sécurisé"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rôle <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={employeeForm.role}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-green-300 appearance-none"
                        >
                          <option value="CASHIER">👨‍💼 Caissier</option>
                          <option value="ADMIN">👑 Administrateur</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 border border-purple-100 dark:border-slate-600">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Informations professionnelles
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Département
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={employeeForm.department}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-300"
                          placeholder="Ex: Ventes"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Poste
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={employeeForm.position}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, position: e.target.value }))}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-300"
                          placeholder="Ex: Caissier principal"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Salaire (XOF)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={employeeForm.salary}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, salary: e.target.value }))}
                          className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-300"
                          placeholder="500000"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handleCloseAddEmployeeModal}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
                  >
                    <div className="flex items-center justify-center">
                      <FaTimes className="mr-2" />
                      Annuler
                    </div>
                  </button>
                  <button
                    type="submit"
                    disabled={creatingEmployee}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    {creatingEmployee ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Création en cours...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FaUserPlus className="mr-2" />
                        Créer l'employé
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyList;