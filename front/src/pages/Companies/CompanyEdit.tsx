import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageMeta from '../../components/common/PageMeta';
import { companiesService, Company, UpdateCompanyData } from '../../services/companies';
import { usersService } from '../../services/users';
import { employeesService, CreateEmployeeData } from '../../services/employees';
import { useToast } from '../../context/ToastContext';
import { createEmployeeWithUserSchema, CreateEmployeeWithUserFormData } from '../../lib/validationSchemas';
import {
  FaBuilding,
  FaArrowLeft,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaUserPlus,
  FaTimes,
  FaUsers,
  FaFileInvoice,
  FaCog,
  FaChartBar,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFileAlt,
  FaQrcode
} from 'react-icons/fa';

const CompanyEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState<UpdateCompanyData & { couleurPrimaire?: string; couleurSecondaire?: string; couleurDashboard?: string; logo?: File | string }>({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    siteWeb: '',
    description: '',
    devise: 'XOF',
    timezone: 'Africa/Dakar',
    periodePayroll: 'MENSUEL',
    estActive: true,
    couleurPrimaire: '',
    couleurSecondaire: '',
    couleurDashboard: '',
    logo: ''
  });

  const [errors, setErrors] = useState<Partial<UpdateCompanyData>>({});

  // Employee creation modal state
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<any>(null);
  const [showQRSuccessModal, setShowQRSuccessModal] = useState(false);

  const employeeForm = useForm<CreateEmployeeWithUserFormData>({
    resolver: zodResolver(createEmployeeWithUserSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'CASHIER',
      phone: '',
      department: '',
      position: '',
      salary: undefined
    }
  });

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
        estActive: data.estActive,
        couleurPrimaire: data.couleurPrimaire || '',
        couleurSecondaire: data.couleurSecondaire || '',
        couleurDashboard: data.couleurDashboard || '',
        logo: data.logo || ''
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
    if (formData.telephone && !/^(\+221|221)?[3-9]\d{7,8}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Format de téléphone invalide (ex: +221 77 123 45 67 ou 77 123 45 67)';
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
      // Prepare data with colors, filter out empty strings, ensure estActive is boolean
      const updateData = {
        ...formData,
        estActive: Boolean(formData.estActive),
        couleurPrimaire: formData.couleurPrimaire && formData.couleurPrimaire.trim() ? formData.couleurPrimaire : undefined,
        couleurSecondaire: formData.couleurSecondaire && formData.couleurSecondaire.trim() ? formData.couleurSecondaire : undefined,
        couleurDashboard: formData.couleurDashboard && formData.couleurDashboard.trim() ? formData.couleurDashboard : undefined,
      };

      await companiesService.updateCompany(parseInt(id), updateData);
      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/companies/${id}`);
      }, 2000);
    } catch (err: unknown) {
      console.error('Erreur lors de la mise à jour de l\'entreprise:', err);
      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          console.log('Détails de validation:', errorData);
          if (errorData.errors) {
            console.table(errorData.errors);
          }
          if (errorData.receivedData) {
            console.log('Données envoyées:', errorData.receivedData);
          }
        } catch {
          // Si ce n'est pas du JSON, afficher le message normal
          setError(err.message);
          return;
        }
      }
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  // Validation is now handled by react-hook-form with Zod

  const handleCreateEmployee = async (data: CreateEmployeeWithUserFormData): Promise<void> => {
    if (!id) {
      return;
    }

    setCreatingEmployee(true);

    try {
      // Create user first
      const user = await usersService.createUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone
      });

      // Build transformed data, only including optional fields if they have values
      const transformedData: CreateEmployeeData = {
        userId: user.id,
        entrepriseId: parseInt(id),
      };

      if (data.department) {
        transformedData.department = data.department;
      }

      if (data.position) {
        transformedData.position = data.position;
      }

      if (data.salary !== undefined) {
        transformedData.salary = Number(data.salary);
      }

      if (data.phone) {
        transformedData.phone = data.phone;
      }

      // Create employee record
      const result = await employeesService.createEmployee(transformedData);

      // Store the created employee for QR code display
      setCreatedEmployee(result.employee);

      // Reset form and close modal
      employeeForm.reset();
      setShowEmployeeModal(false);

      // Show success message
      showSuccess('Succès', 'Employé créé avec succès !');

      // Show QR code modal
      setShowQRSuccessModal(true);
    } catch (err: unknown) {
      console.error('Error creating employee:', err);
      showError('Erreur', err instanceof Error ? err.message : 'Erreur lors de la création de l\'employé');
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
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 p-6 ${showEmployeeModal ? 'blur-sm' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6">
            {/* Company Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <FaBuilding className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Entreprise inconnue
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Gestion entreprise
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
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
        title={`Modifier ${company?.nom || 'Entreprise'} | Système RH`}
        description={`Modifier les informations de ${company?.nom || 'l\'entreprise'}`}
      />

      <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 p-6 ${showEmployeeModal ? 'blur-sm' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6">
            {/* Company Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    {company?.logo ? (
                      <img
                        src={`http://localhost:5000${company.logo}`}
                        alt={`${company.nom} logo`}
                        className="w-12 h-12 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <FaBuilding className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {company?.nom}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Gestion entreprise
                    </p>
                  </div>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => navigate(`/companies/${id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <FaInfoCircle className="h-4 w-4 text-blue-500" />
                    Vue d'ensemble
                  </button>

                  <button
                    onClick={() => navigate(`/companies/${id}/dashboard`)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <FaChartBar className="h-4 w-4 text-green-500" />
                    Tableau de bord
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <FaUsers className="h-4 w-4 text-purple-500" />
                    Employés ({company?.nombreEmployes || 0})
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <FaMoneyBillWave className="h-4 w-4 text-yellow-500" />
                    Paie & Salaires
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <FaFileInvoice className="h-4 w-4 text-indigo-500" />
                    Factures
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <FaCalendarAlt className="h-4 w-4 text-red-500" />
                    Congés
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <FaFileAlt className="h-4 w-4 text-teal-500" />
                    Documents
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                  >
                    <FaCog className="h-4 w-4 text-blue-500" />
                    Configuration
                  </button>
                </nav>

                {/* Company Stats */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Statistiques
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Employés actifs</span>
                      <span className="font-medium text-gray-900 dark:text-white">{company?.employesActifs || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Salaire moyen</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {company?.salaireMoyen ? `${company.salaireMoyen.toLocaleString()} ${company.devise}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Période paie</span>
                      <span className="font-medium text-gray-900 dark:text-white">{company?.periodePayroll}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
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
                        Modifier les informations de {company?.nom}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmployeeModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <FaUserPlus className="mr-2" />
                    Ajouter Employé
                  </button>
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

                  {/* Logo de l'entreprise */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo de l'entreprise
                    </label>
                    <div className="flex items-center space-x-4">
                      {formData.logo && typeof formData.logo === 'string' && (
                        <div className="w-16 h-16 border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden">
                          <img
                            src={`http://localhost:5000${formData.logo}`}
                            alt="Logo actuel"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          name="logo"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData(prev => ({ ...prev, logo: file }));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Formats acceptés: JPG, PNG, GIF. Taille maximale: 2MB
                        </p>
                      </div>
                    </div>
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
                      <option value="BIMENSUEL">Bimensuel</option>
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
                      <option value="Africa/Dakar">Africa/Dakar (GMT+0)</option>
                      <option value="Africa/Abidjan">Africa/Abidjan (GMT+0)</option>
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                      <option value="America/New_York">America/New_York (GMT-5)</option>
                    </select>
                  </div>

                  {/* Couleurs du thème */}
                  <div className="lg:col-span-2">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <FaCog className="mr-2 text-purple-600" />
                      Personnalisation du thème
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Couleur primaire
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        name="couleurPrimaire"
                        value={formData.couleurPrimaire || '#3b82f6'}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 dark:border-slate-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        name="couleurPrimaire"
                        value={formData.couleurPrimaire || ''}
                        onChange={handleInputChange}
                        placeholder="#3b82f6"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Couleur secondaire
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        name="couleurSecondaire"
                        value={formData.couleurSecondaire || '#10b981'}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 dark:border-slate-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        name="couleurSecondaire"
                        value={formData.couleurSecondaire || ''}
                        onChange={handleInputChange}
                        placeholder="#10b981"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Couleur du dashboard
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        name="couleurDashboard"
                        value={formData.couleurDashboard || '#1f2937'}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 dark:border-slate-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        name="couleurDashboard"
                        value={formData.couleurDashboard || ''}
                        onChange={handleInputChange}
                        placeholder="#1f2937"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* Employee Creation Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FaUserPlus className="mr-3 text-purple-600" />
                  Ajouter un employé à {company?.nom}
                </h2>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={employeeForm.handleSubmit(handleCreateEmployee)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Informations personnelles
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...employeeForm.register('firstName')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Jean"
                    />
                    {employeeForm.formState.errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeForm.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...employeeForm.register('lastName')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Dupont"
                    />
                    {employeeForm.formState.errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeForm.formState.errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...employeeForm.register('email')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="exemple@email.com"
                    />
                    {employeeForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      {...employeeForm.register('phone')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="+221 77 123 45 67"
                    />
                    {employeeForm.formState.errors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...employeeForm.register('password')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Mot de passe"
                    />
                    {employeeForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...employeeForm.register('role')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="CASHIER">Caissier</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                    {employeeForm.formState.errors.role && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeForm.formState.errors.role.message}</p>
                    )}
                  </div>

                  {/* Professional Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 mt-6">
                      Informations professionnelles
                    </h3>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Département
                    </label>
                    <input
                      type="text"
                      {...employeeForm.register('department')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Ventes"
                    />
                    {employeeForm.formState.errors.department && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeForm.formState.errors.department.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poste
                    </label>
                    <input
                      type="text"
                      {...employeeForm.register('position')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Caissier principal"
                    />
                    {employeeForm.formState.errors.position && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeForm.formState.errors.position.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salaire (XOF)
                    </label>
                    <input
                      type="number"
                      {...employeeForm.register('salary', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Ex: 500000"
                      min="0"
                    />
                    {employeeForm.formState.errors.salary && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{employeeForm.formState.errors.salary.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEmployeeModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creatingEmployee}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
            </div>
          </div>
        </div>
      )}

      {/* QR Code Success Modal */}
      {showQRSuccessModal && createdEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FaQrcode className="mr-3 text-green-600" />
                  QR Code généré avec succès !
                </h2>
                <button
                  onClick={() => {
                    setShowQRSuccessModal(false);
                    setCreatedEmployee(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <div className="text-center">
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Employé: <span className="font-semibold text-gray-900 dark:text-white">
                      {createdEmployee.user?.firstName} {createdEmployee.user?.lastName}
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    ID: <span className="font-mono text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {createdEmployee.employeeId}
                    </span>
                  </p>
                </div>

                {createdEmployee.qrCode && (
                  <div className="mb-6">
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg inline-block">
                      <img
                        src={createdEmployee.qrCode}
                        alt={`QR Code ${createdEmployee.employeeId}`}
                        className="w-48 h-48 mx-auto border border-gray-300 dark:border-slate-600 rounded"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Ce QR code peut être utilisé pour le pointage
                    </p>
                  </div>
                )}

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      // Download QR code functionality
                      const link = document.createElement('a');
                      link.href = createdEmployee.qrCode;
                      link.download = `qr-${createdEmployee.employeeId}.png`;
                      link.click();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Télécharger QR
                  </button>
                  <button
                    onClick={() => {
                      setShowQRSuccessModal(false);
                      setCreatedEmployee(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyEdit;