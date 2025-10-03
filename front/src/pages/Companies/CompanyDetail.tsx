import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { companiesService, Company } from '../../services/companies';
import { employeesService, Employee } from '../../services/employees';
import {
  FaBuilding,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaUsers,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaCalendarAlt,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCompany();
    }
  }, [id]);

  const loadCompany = async () => {
    if (!id || isNaN(parseInt(id))) {
      setError('ID d\'entreprise invalide');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await companiesService.getCompanyById(parseInt(id));
      setCompany(data);
      setError(null);
      // Load employees for this company
      await loadEmployees();
    } catch (err) {
      setError('Erreur lors du chargement de l\'entreprise');
      console.error('Error loading company:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
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
  };

  const handleToggleStatus = async () => {
    if (!company) return;
    try {
      await companiesService.toggleCompanyStatus(company.id);
      await loadCompany(); // Recharger les données
    } catch (err) {
      console.error('Error toggling company status:', err);
      setError('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async () => {
    if (!company) return;
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise "${company.nom}" ? Cette action est irréversible.`)) {
      try {
        await companiesService.deleteCompany(company.id);
        // Rediriger vers la liste
        window.location.href = '/companies';
      } catch (err) {
        console.error('Error deleting company:', err);
        setError('Erreur lors de la suppression de l\'entreprise');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement de l'entreprise...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="text-center py-12">
              <FaBuilding className="mx-auto h-12 w-18 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {error || 'Entreprise non trouvée'}
              </h3>
              <div className="mt-6">
                <Link
                  to="/companies"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  Retour à la liste
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${company.nom} | Système RH`}
        description={`Détails de l'entreprise ${company.nom}`}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center">
                <Link
                  to="/companies"
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    {company.logo ? (
                      <img
                        src={`http://localhost:5000${company.logo}`}
                        alt={`${company.nom} logo`}
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <FaBuilding className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {company.nom}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {company.description || 'Aucune description'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/companies/${company.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Modifier
                </Link>
                <button
                  onClick={handleToggleStatus}
                  className={`inline-flex items-center px-4 py-2 ${
                    company.estActive
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white font-medium rounded-lg transition-colors`}
                >
                  {company.estActive ? <FaToggleOff className="mr-2" /> : <FaToggleOn className="mr-2" />}
                  {company.estActive ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FaTrash className="mr-2" />
                  Supprimer
                </button>
              </div>
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

          {/* Company Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informations générales
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Adresse</p>
                    <p className="text-gray-900 dark:text-white">{company.adresse || 'Non spécifiée'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaPhone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Téléphone</p>
                    <p className="text-gray-900 dark:text-white">{company.telephone || 'Non spécifié'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white">{company.email || 'Non spécifié'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaGlobe className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Site web</p>
                    <p className="text-gray-900 dark:text-white">
                      {company.siteWeb ? (
                        <a
                          href={company.siteWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {company.siteWeb}
                        </a>
                      ) : 'Non spécifié'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Créée le</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(company.creeLe).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informations commerciales
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Devise</p>
                  <p className="text-gray-900 dark:text-white font-medium">{company.devise}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Période de paie</p>
                  <p className="text-gray-900 dark:text-white font-medium">{company.periodePayroll}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fuseau horaire</p>
                  <p className="text-gray-900 dark:text-white font-medium">{company.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.estActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {company.estActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <FaUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employés totaux</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{company.nombreEmployes}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {company.employesActifs} actifs
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <FaMoneyBillWave className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salaire moyen</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {company.salaireMoyen ? company.salaireMoyen.toLocaleString() : 'N/A'} {company.devise}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <FaBuilding className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Entreprise</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{company.nom}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {company.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee List Section */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Liste des employés</h2>
          {employeesLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des employés...</span>
            </div>
          ) : employees.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Aucun employé trouvé pour cette entreprise.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">Nom</th>
                  <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">Email</th>
                  <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">Téléphone</th>
                  <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">Département</th>
                  <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">Poste</th>
                  <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                      {emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : 'N/A'}
                    </td>
                    <td className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">{emp.user?.email || 'N/A'}</td>
                    <td className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">{emp.phone || emp.user?.phone || 'N/A'}</td>
                    <td className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">{emp.department || 'N/A'}</td>
                    <td className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">{emp.position || 'N/A'}</td>
                    <td className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">{emp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default CompanyDetail;