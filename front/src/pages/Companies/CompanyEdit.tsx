import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { companiesService, Company, UpdateCompanyData } from '../../services/companies';
import { usersService, CreateUserData } from '../../services/users';
import { employeesService } from '../../services/employees';
import {
  FaBuilding,
  FaArrowLeft,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaUserPlus,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const CompanyEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState<UpdateCompanyData>({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    siteWeb: '',
    description: '',
    devise: 'XOF',
    timezone: 'Africa/Dakar',
    periodePayroll: 'MENSUEL',
    estActive: true
  });

  const [errors, setErrors] = useState<Partial<UpdateCompanyData>>({});

  // Employee creation state
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState<CreateUserData & { employeeId: string; department?: string; position?: string; salary?: number }>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CASHIER',
    phone: '',
    employeeId: '',
    department: '',
    position: '',
    salary: undefined
  });
  const [employeeErrors, setEmployeeErrors] = useState<Partial<CreateUserData & { employeeId: string }>>({});
  const [creatingEmployee, setCreatingEmployee] = useState(false);

  useEffect(() => {
    if (id) {
      loadCompany();
    }
  }, [id]);

  const loadCompany = async () => {
    try {
      setFetchLoading(true);
      const data = await companiesService.getCompanyById(parseInt(id!));
      setCompany(data);
      setFormData({
        nom: data.nom,
        adresse: data.adresse || '',
        telephone: data.telephone || '',
        email: data.email || '',
        siteWeb: data.siteWeb || '',
        description: data.description || '',
        devise: data.devise,
        timezone: data.timezone,
        periodePayroll: data.periodePayroll,
        estActive: data.estActive
      });
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de l\'entreprise');
      console.error('Error loading company:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateCompanyData> = {};

    // Validation du nom
    if (!formData.nom?.trim()) {
      newErrors.nom = 'Le nom de l\'entreprise est requis';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation de l'email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation du téléphone (format sénégalais)
    if (formData.telephone && !/^(\+221|221)?[76-8]\d{7}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Format de téléphone invalide (ex: +221 77 123 45 67)';
    }

    // Validation du site web
    if (formData.siteWeb && !/^https?:\/\/.+/.test(formData.siteWeb)) {
      newErrors.siteWeb = 'L\'URL doit commencer par http:// ou https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof UpdateCompanyData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await companiesService.updateCompany(parseInt(id), formData);
      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/companies/${id}`);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const validateEmployeeForm = (): boolean => {
    const newErrors: Partial<CreateUserData & { employeeId: string }> = {};

    if (!employeeFormData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!employeeFormData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!employeeFormData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeFormData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!employeeFormData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (employeeFormData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (!employeeFormData.employeeId.trim()) {
      newErrors.employeeId = 'L\'ID employé est requis';
    }

    setEmployeeErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmployeeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployeeFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? (value ? parseFloat(value) : undefined) : value
    }));

    if (employeeErrors[name as keyof typeof employeeErrors]) {
      setEmployeeErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmployeeForm() || !id) {
      return;
    }

    setCreatingEmployee(true);

    try {
      // Create user first
      const user = await usersService.createUser({
        email: employeeFormData.email,
        password: employeeFormData.password,
        firstName: employeeFormData.firstName,
        lastName: employeeFormData.lastName,
        role: employeeFormData.role,
        phone: employeeFormData.phone
      });

      // Create employee record
      await employeesService.createEmployee({
        userId: user.id,
        entrepriseId: parseInt(id),
        employeeId: employeeFormData.employeeId,
        department: employeeFormData.department,
        position: employeeFormData.position,
        salary: employeeFormData.salary?.toString(),
        phone: employeeFormData.phone
      });

      // Reset form
      setEmployeeFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'CASHIER',
        phone: '',
        employeeId: '',
        department: '',
        position: '',
        salary: undefined
      });
      setEmployeeErrors({});
      setShowEmployeeForm(false);

      // Show success message
      alert('Employé créé avec succès !');
    } catch (err: unknown) {
      console.error('Error creating employee:', err);
      alert(err instanceof Error ? err.message : 'Erreur lors de la création de l\'employé');
    } finally {
      setCreatingEmployee(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
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

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="text-center py-12">
              <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Entreprise non trouvée
              </h3>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/companies')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  Retour à la liste
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
            <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Entreprise mise à jour avec succès !
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Les modifications de "{formData.nom}" ont été enregistrées.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirection vers les détails...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Modifier ${company.nom} | Système RH`}
        description={`Modifier les informations de ${company.nom}`}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(`/companies/${id}`)}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FaBuilding className="mr-3 text-blue-600" />
                    Modifier l'Entreprise
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Modifier les informations de {company.nom}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-600" />
                  Informations de base
                </h3>
              </div>

              {/* Nom de l'entreprise */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                    errors.nom ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  placeholder="Ex: TechnoSenegal SARL"
                  required
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nom}</p>
                )}
              </div>

              {/* Adresse */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse
                </label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Adresse complète de l'entreprise"
                />
              </div>

              {/* Email et Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  placeholder="contact@entreprise.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                    errors.telephone ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  placeholder="+221 77 123 45 67"
                />
                {errors.telephone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telephone}</p>
                )}
              </div>

              {/* Site web */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  name="siteWeb"
                  value={formData.siteWeb}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                    errors.siteWeb ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  placeholder="https://www.entreprise.com"
                />
                {errors.siteWeb && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.siteWeb}</p>
                )}
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Description de l'entreprise, ses activités, etc."
                />
              </div>

              {/* Paramètres système */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaBuilding className="mr-2 text-green-600" />
                  Paramètres système
                </h3>
              </div>

              {/* Devise et Période de paie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Devise <span className="text-red-500">*</span>
                </label>
                <select
                  name="devise"
                  value={formData.devise}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="XOF">Franc CFA (XOF)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Période de paie <span className="text-red-500">*</span>
                </label>
                <select
                  name="periodePayroll"
                  value={formData.periodePayroll}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="MENSUEL">Mensuel</option>
                  <option value="QUINZAINE">Quinzaine</option>
                  <option value="HEBDOMADAIRE">Hebdomadaire</option>
                </select>
              </div>

              {/* Fuseau horaire */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuseau horaire <span className="text-red-500">*</span>
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="Africa/Dakar">Afrique/Dakar (GMT+0)</option>
                  <option value="Africa/Abidjan">Afrique/Abidjan (GMT+0)</option>
                  <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  <option value="America/New_York">Amérique/New York (GMT-5)</option>
                </select>
              </div>

              {/* Statut */}
              <div className="lg:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="estActive"
                    checked={formData.estActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Entreprise active
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/companies/${id}`)}
                className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Mettre à jour
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Employee Creation Section */}
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FaUserPlus className="mr-2 text-green-600" />
                Ajouter un employé
              </h3>
              <button
                onClick={() => setShowEmployeeForm(!showEmployeeForm)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {showEmployeeForm ? <FaChevronUp className="mr-2" /> : <FaChevronDown className="mr-2" />}
                {showEmployeeForm ? 'Masquer' : 'Afficher'}
              </button>
            </div>

            {showEmployeeForm && (
              <form onSubmit={handleCreateEmployee} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="lg:col-span-2">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Informations personnelles
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={employeeFormData.firstName}
                      onChange={handleEmployeeInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                        employeeErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Ex: Jean"
                      required
                    />
                    {employeeErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={employeeFormData.lastName}
                      onChange={handleEmployeeInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                        employeeErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Ex: Dupont"
                      required
                    />
                    {employeeErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={employeeFormData.email}
                      onChange={handleEmployeeInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                        employeeErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="exemple@email.com"
                      required
                    />
                    {employeeErrors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={employeeFormData.phone}
                      onChange={handleEmployeeInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="+221 77 123 45 67"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={employeeFormData.password}
                      onChange={handleEmployeeInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                        employeeErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Mot de passe"
                      required
                    />
                    {employeeErrors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={employeeFormData.role}
                      onChange={handleEmployeeInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="CASHIER">Caissier</option>
                      <option value="EMPLOYEE">Employé</option>
                    </select>
                  </div>

                  {/* Employee Information */}
                  <div className="lg:col-span-2">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 mt-6">
                      Informations professionnelles
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID Employé <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={employeeFormData.employeeId}
                      onChange={handleEmployeeInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                        employeeErrors.employeeId ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Ex: EMP001"
                      required
                    />
                    {employeeErrors.employeeId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeErrors.employeeId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Département
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={employeeFormData.department}
                      onChange={handleEmployeeInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Ventes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poste
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={employeeFormData.position}
                      onChange={handleEmployeeInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Caissier principal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salaire (XOF)
                    </label>
                    <input
                      type="number"
                      name="salary"
                      value={employeeFormData.salary || ''}
                      onChange={handleEmployeeInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: 500000"
                      min="0"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={creatingEmployee}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {creatingEmployee ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Création...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="mr-2" />
                        Créer l'employé
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyEdit;