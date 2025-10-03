import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { employeesService, Employee, PaginatedEmployeesResponse } from "../../services/employees";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/button/Button";
import InputField from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Checkbox from "../../components/form/input/Checkbox";
import Pagination from "../../components/ui/Pagination";

// Modal Component for Employee Details
const EmployeeDetailsModal = ({ employee, isOpen, onClose }: { employee: Employee | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Détails de l'employé
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
              {employee.user ? `${employee.user.firstName.charAt(0)}${employee.user.lastName.charAt(0)}` : employee.employeeId.slice(0, 2)}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {employee.user ? `${employee.user.firstName} ${employee.user.lastName}` : employee.employeeId}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {employee.employeeId}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Entreprise</div>
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                Entreprise {employee.entrepriseId}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Département</div>
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                {employee.department || 'Non assigné'}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Poste</div>
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                {employee.position || 'Non défini'}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type de contrat</div>
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                {employee.contractType === 'FIXED_SALARY' ? 'Salaire fixe' :
                 employee.contractType === 'DAILY' ? 'Journalier' :
                 employee.contractType === 'HOURLY' ? 'Honoraire' : 'Non défini'}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Salaire</div>
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                {employee.salary ? `${employee.salary.toLocaleString()} XOF` : 'Non défini'}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Statut</div>
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                {employee.status === 'ACTIVE' ? 'Actif' : employee.status === 'INACTIVE' ? 'Inactif' : 'Terminé'}
              </div>
            </div>

            {employee.user?.email && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {employee.user.email}
                </div>
              </div>
            )}

            {(employee.phone || employee.user?.phone) && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Téléphone</div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {employee.phone || employee.user?.phone}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function EmployeeList() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [employeesData, setEmployeesData] = useState<PaginatedEmployeesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForms, setShowForms] = useState(false);
  const [companyName, setCompanyName] = useState("sali seductionio");
  const [companyAddress, setCompanyAddress] = useState("keur massar");
  const [companyEmail, setCompanyEmail] = useState("sali@gmail.com");
  const [companyPhone, setCompanyPhone] = useState("+221774646923");
  const [companyWebsite, setCompanyWebsite] = useState("https://porfolio-sigma-rosy.vercel.app/");
  const [companyDescription, setCompanyDescription] = useState("you nice lay diaye");
  const [companyActive, setCompanyActive] = useState(true);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [contractFilter, setContractFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");

  // Modal state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonction pour activer/désactiver un employé
  const toggleEmployeeStatus = async (employeeId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await employeesService.updateEmployee(employeeId, { status: newStatus });

      // Mettre à jour la liste localement
      if (employeesData) {
        setEmployeesData({
          ...employeesData,
          employees: employeesData.employees.map(emp =>
            emp.id === employeeId ? { ...emp, status: newStatus } : emp
          )
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showError('Erreur', 'Erreur lors de la mise à jour du statut de l\'employé');
    }
  };

  // Fonction pour voir les détails d'un employé
  const viewEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  // Fonction pour modifier un employé
  const editEmployee = (employeeId: number) => {
    // Naviguer vers la page d'édition (si elle existe)
    navigate(`/employees/${employeeId}/edit`);
  };

  // Fonction pour supprimer un employé
  const deleteEmployee = async (employeeId: number, employeeName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'employé ${employeeName} ? Cette action est irréversible.`)) {
      try {
        await employeesService.deleteEmployee(employeeId);
        // Mettre à jour la liste localement
        if (employeesData) {
          setEmployeesData({
            ...employeesData,
            employees: employeesData.employees.filter(emp => emp.id !== employeeId)
          });
        }
        showSuccess('Succès', 'Employé supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showError('Erreur', 'Erreur lors de la suppression de l\'employé');
      }
    }
  };

  const fetchEmployees = async (page = currentPage, limit = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeesService.getAllEmployees(page, limit);
      setEmployeesData(data);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, pageSize]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", label: "Actif" },
      INACTIVE: { color: "bg-red-100 text-red-800", label: "Inactif" },
      TERMINATED: { color: "bg-gray-100 text-gray-800", label: "Terminé" }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
  };

  // Filtrage des employés
  const filteredEmployees = (employeesData?.employees || []).filter(employee => {
    if (statusFilter && employee.status !== statusFilter) return false;
    if (contractFilter && employee.contractType !== contractFilter) return false;
    if (departmentFilter && employee.department !== departmentFilter) return false;
    if (positionFilter && employee.position !== positionFilter) return false;
    if (companyFilter && employee.entrepriseId.toString() !== companyFilter) return false;
    return true;
  });

  return (
    <>
      <PageMeta
        title="Liste des Employés | Gestion RH"
        description="Consultez et gérez tous les employés de l'entreprise"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Liste des Employés
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez tous les employés de votre entreprise
            </p>
          </div>
          {/* <button
            onClick={() => setShowForms(!showForms)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showForms ? 'Masquer les formulaires' : 'Ajouter un Employé'}
          </button> */}
        </div>

        {/* Forms Section */}
        {showForms && (
          <div className="flex gap-2">
            {/* Company Information Form */}
            <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Informations de base
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom de l'entreprise *
                  </label>
                  <InputField
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adresse
                  </label>
                  <InputField
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <InputField
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <InputField
                    type="tel"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Site web
                  </label>
                  <InputField
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Devise *
                    </label>
                    <Select
                      options={[
                        { value: 'XOF', label: 'Franc CFA (XOF)' }
                      ]}
                      defaultValue="XOF"
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Période de paie *
                    </label>
                    <Select
                      options={[
                        { value: 'MENSUEL', label: 'Mensuel' }
                      ]}
                      defaultValue="MENSUEL"
                      onChange={() => {}}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fuseau horaire *
                  </label>
                  <Select
                    options={[
                      { value: 'Africa/Dakar', label: 'Afrique/Dakar (GMT+0)' }
                    ]}
                    defaultValue="Africa/Dakar"
                    onChange={() => {}}
                  />
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="active"
                    checked={companyActive}
                    onChange={setCompanyActive}
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Entreprise active
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowForms(false)}>
                    Annuler
                  </Button>
                  <Button>
                    Mettre à jour
                  </Button>
                </div>
              </div>
            </div>

            {/* Add Employee Form */}
            <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Ajouter un employé
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
                    Informations personnelles
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prénom *
                      </label>
                      <InputField
                        type="text"
                        placeholder="Ex: Jean"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom *
                      </label>
                      <InputField
                        type="text"
                        placeholder="Ex: Dupont"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <InputField
                      type="email"
                      placeholder="exemple@email.com"
                      className="w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Téléphone
                    </label>
                    <InputField
                      type="tel"
                      placeholder="+221 77 123 45 67"
                      className="w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mot de passe *
                    </label>
                    <InputField
                      type="password"
                      className="w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rôle *
                    </label>
                    <Select
                      options={[
                        { value: 'CASHIER', label: 'Caissier' },
                        { value: 'ADMIN', label: 'Admin' }
                      ]}
                      defaultValue="CASHIER"
                      onChange={() => {}}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">
                    Informations professionnelles
                  </h4>
                  {/* Le matricule est maintenant généré automatiquement */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Département
                    </label>
                    <InputField
                      type="text"
                      placeholder="Ex: Ventes"
                      className="w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Poste
                    </label>
                    <InputField
                      type="text"
                      placeholder="Ex: Caissier principal"
                      className="w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type de contrat *
                    </label>
                    <Select
                      options={[
                        { value: 'FIXED_SALARY', label: 'Salaire fixe' },
                        { value: 'DAILY', label: 'Journalier' },
                        { value: 'HOURLY', label: 'Honoraire' }
                      ]}
                      defaultValue="FIXED_SALARY"
                      onChange={() => {}}
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Salaire/Taux (XOF)
                    </label>
                    <InputField
                      type="number"
                      placeholder="Ex: 500000 (fixe) ou 25000 (journalier)"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={() => setShowForms(false)}>
                    Masquer
                  </Button>
                  <Button>
                    Créer l'employé
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Filtres avancés
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <Select
                options={[
                  { value: "", label: "Tous les statuts" },
                  { value: "ACTIVE", label: "Actif" },
                  { value: "INACTIVE", label: "Inactif" },
                  { value: "TERMINATED", label: "Terminé" }
                ]}
                defaultValue=""
                onChange={(value) => setStatusFilter(value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de contrat
              </label>
              <Select
                options={[
                  { value: "", label: "Tous les contrats" },
                  { value: "FIXED_SALARY", label: "Salaire fixe" },
                  { value: "DAILY", label: "Journalier" },
                  { value: "HOURLY", label: "Honoraire" }
                ]}
                defaultValue=""
                onChange={(value) => setContractFilter(value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Département
              </label>
              <Select
                options={[
                  { value: "", label: "Tous les départements" },
                  ...Array.from(new Set((employeesData?.employees || []).map(emp => emp.department).filter(Boolean))).map(dept => ({
                    value: dept || "",
                    label: dept || ""
                  }))
                ]}
                defaultValue=""
                onChange={(value) => setDepartmentFilter(value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poste
              </label>
              <Select
                options={[
                  { value: "", label: "Tous les postes" },
                  ...Array.from(new Set((employeesData?.employees || []).map(emp => emp.position).filter(Boolean))).map(pos => ({
                    value: pos || "",
                    label: pos || ""
                  }))
                ]}
                defaultValue=""
                onChange={(value) => setPositionFilter(value)}
              />
            </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Entreprise
               </label>
               <Select
                 options={[
                   { value: "", label: "Toutes les entreprises" },
                   ...Array.from(new Set((employeesData?.employees || []).map(emp => emp.entrepriseId).filter(Boolean))).map(companyId => ({
                     value: companyId?.toString() || "",
                     label: `Entreprise ${companyId}` // TODO: Récupérer le nom de l'entreprise depuis l'API
                   }))
                 ]}
                 defaultValue=""
                 onChange={(value) => setCompanyFilter(value)}
               />
             </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">Total Employés</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{employeesData?.pagination.totalItems || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">👥</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">Actifs</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {(employeesData?.employees || []).filter(emp => emp.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">✓</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">Départements</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {new Set((employeesData?.employees || []).map(emp => emp.department)).size}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">🏢</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">Salaire Moyen</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {(() => {
                    const employeesWithSalary = (employeesData?.employees || []).filter(emp => emp.salary && emp.salary > 0);
                    if (employeesWithSalary.length === 0) return '0 XOF';
                    const average = employeesWithSalary.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employeesWithSalary.length;
                    return isNaN(average) ? '0 XOF' : Math.round(average).toLocaleString() + ' XOF';
                  })()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Employees Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Tous les Employés ({filteredEmployees.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-600 dark:text-red-400">
                {error}
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <p className="text-gray-600 dark:text-gray-400">Aucun employé trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEmployees.map((employee) => {
                const statusBadge = getStatusBadge(employee.status);
                return (
                  <div key={employee.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Header avec avatar et statut */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {employee.user ? `${employee.user.firstName.charAt(0)}${employee.user.lastName.charAt(0)}` : employee.employeeId.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {employee.user ? `${employee.user.firstName} ${employee.user.lastName}` : employee.employeeId}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {employee.employeeId}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      {/* Entreprise */}
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Entreprise {employee.entrepriseId}
                        </span>
                      </div>
                    </div>

                    {/* Corps de la carte */}
                    <div className="p-6 space-y-4">
                      {/* Informations professionnelles */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Département</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.department || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Poste</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.position || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Contrat</span>
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            employee.contractType === 'FIXED_SALARY' ? 'bg-blue-100 text-blue-800' :
                            employee.contractType === 'DAILY' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {employee.contractType === 'FIXED_SALARY' ? 'Fixe' :
                             employee.contractType === 'DAILY' ? 'Journalier' :
                             'Honoraire'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Salaire</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.salary ? `${employee.salary.toLocaleString()} XOF` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* QR Code et Matricule */}
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Matricule</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                              {employee.employeeId}
                            </span>
                          </div>
                          {employee.qrCode && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Code QR</span>
                              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                {employee.qrCode.substring(0, 16)}...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">📧</span>
                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                              {employee.user?.email || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">📱</span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {employee.phone || employee.user?.phone || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => viewEmployeeDetails(employee)}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                          title="Voir détails"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleEmployeeStatus(employee.id, employee.status)}
                            className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                              employee.status === 'ACTIVE'
                                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                            title={employee.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                          >
                            {employee.status === 'ACTIVE' ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => editEmployee(employee.id)}
                            className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-lg transition-colors flex items-center justify-center"
                            title="Modifier"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteEmployee(employee.id, `${employee.user?.firstName} ${employee.user?.lastName}`)}
                            className="flex-1 px-3 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg transition-colors flex items-center justify-center"
                            title="Supprimer"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {employeesData && employeesData.pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={employeesData.pagination.currentPage}
              totalPages={employeesData.pagination.totalPages}
              totalItems={employeesData.pagination.totalItems}
              itemsPerPage={employeesData.pagination.itemsPerPage}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
              onPageSizeChange={(pageSize) => {
                setPageSize(pageSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      <EmployeeDetailsModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}