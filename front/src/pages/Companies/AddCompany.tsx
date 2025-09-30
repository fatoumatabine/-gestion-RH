import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { companiesService, CreateCompanyData } from '../../services/companies';
import {
  FaBuilding,
  FaArrowLeft,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';

const AddCompany: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateCompanyData>({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    siteWeb: '',
    description: '',
    devise: 'XOF',
    timezone: 'Africa/Dakar',
    periodePayroll: 'MENSUEL'
  });

  const [errors, setErrors] = useState<Partial<CreateCompanyData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateCompanyData> = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom de l\'entreprise est requis';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    } else if (formData.nom.trim().length > 100) {
      newErrors.nom = 'Le nom ne peut pas dépasser 100 caractères';
    } else if (!/^[a-zA-ZÀ-ÿ\s\-'&]+$/.test(formData.nom.trim())) {
      newErrors.nom = 'Le nom contient des caractères invalides';
    }

    // Validation de l'email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation du téléphone (format sénégalais)
    if (formData.telephone && !/^(\+221|221)?[76-8]\d{8}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Format de téléphone invalide (ex: +221 77 123 45 67)';
    }

    // Validation du site web - laissée au backend

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof CreateCompanyData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await companiesService.createCompany(formData);
      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/companies');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
            <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Entreprise créée avec succès !
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              L'entreprise "{formData.nom}" a été ajoutée au système.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirection vers la liste des entreprises...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Ajouter une Entreprise | Système RH"
        description="Créer une nouvelle entreprise"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/companies')}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FaBuilding className="mr-3 text-blue-600" />
                    Ajouter une Entreprise
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Créer une nouvelle entreprise dans le système
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
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/companies')}
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
                    Création...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Créer l'entreprise
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddCompany;