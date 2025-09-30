import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { companiesService, Company } from '../../services/companies';
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
} from 'react-icons/fa';

const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companiesService.getAllCompanies();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des entreprises');
      console.error('Error loading companies:', err);
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

  const filteredCompanies = companies.filter(company => {
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
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                <FaBuilding className="h-5 w-5 text-white" />
                              </div>
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{companies.length}</p>
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
                    {companies.filter(c => c.estActive).length}
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
                    {companies.reduce((sum, c) => sum + c.nombreEmployes, 0)}
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
                    {companies.length > 0
                      ? Math.round(companies.reduce((sum, c) => sum + (c.salaireMoyen || 0), 0) / companies.length).toLocaleString()
                      : 0} FCFA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyList;