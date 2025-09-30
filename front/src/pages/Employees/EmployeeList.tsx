import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { employeesService, Employee } from "../../services/employees";
import Button from "../../components/ui/button/Button";
import InputField from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Checkbox from "../../components/form/input/Checkbox";

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fonction pour activer/désactiver un employé
  const toggleEmployeeStatus = async (employeeId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await employeesService.updateEmployee(employeeId, { status: newStatus });

      // Mettre à jour la liste localement
      setEmployees(employees.map(emp =>
        emp.id === employeeId ? { ...emp, status: newStatus } : emp
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut de l\'employé');
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await employeesService.getAllEmployees();
        setEmployees(data);
      } catch (err) {
        console.error('Error loading employees:', err);
        setError('Erreur lors du chargement des employés');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", label: "Actif" },
      INACTIVE: { color: "bg-red-100 text-red-800", label: "Inactif" },
      TERMINATED: { color: "bg-gray-100 text-gray-800", label: "Terminé" }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
  };

  // Filtrage des employés
  const filteredEmployees = employees.filter(employee => {
    if (statusFilter && employee.status !== statusFilter) return false;
    if (contractFilter && employee.contractType !== contractFilter) return false;
    if (departmentFilter && employee.department !== departmentFilter) return false;
    if (positionFilter && employee.position !== positionFilter) return false;
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
          <button
            onClick={() => setShowForms(!showForms)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showForms ? 'Masquer les formulaires' : 'Ajouter un Employé'}
          </button>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ID Employé *
                    </label>
                    <InputField
                      type="text"
                      placeholder="Ex: EMP001"
                      className="w-full"
                    />
                  </div>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  ...Array.from(new Set(employees.map(emp => emp.department).filter(Boolean))).map(dept => ({
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
                  ...Array.from(new Set(employees.map(emp => emp.position).filter(Boolean))).map(pos => ({
                    value: pos || "",
                    label: pos || ""
                  }))
                ]}
                defaultValue=""
                onChange={(value) => setPositionFilter(value)}
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
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{employees.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">Actifs</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {employees.filter(emp => emp.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">Départements</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {new Set(employees.map(emp => emp.department)).size}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">Salaire Moyen</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {employees.length > 0 ? Math.round(employees.filter(emp => emp.salary).reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.filter(emp => emp.salary).length).toLocaleString() : 0} XOF
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Tous les Employés
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Département
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Poste
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Contrat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Téléphone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Salaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredEmployees.map((employee) => {
                    const statusBadge = getStatusBadge(employee.status);
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {employee.user ? `${employee.user.firstName.charAt(0)}${employee.user.lastName.charAt(0)}` : employee.employeeId.slice(0, 2)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {employee.user ? `${employee.user.firstName} ${employee.user.lastName}` : employee.employeeId}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {employee.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {employee.position}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            employee.contractType === 'FIXED_SALARY' ? 'bg-blue-100 text-blue-800' :
                            employee.contractType === 'DAILY' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {employee.contractType === 'FIXED_SALARY' ? 'Fixe' :
                             employee.contractType === 'DAILY' ? 'Journalier' :
                             'Honoraire'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {employee.user?.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {employee.phone || employee.user?.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {employee.salary ? employee.salary.toLocaleString() : 'N/A'} XOF
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleEmployeeStatus(employee.id, employee.status)}
                              className={`${
                                employee.status === 'ACTIVE'
                                  ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300'
                                  : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                              }`}
                              title={employee.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {employee.status === 'ACTIVE' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                )}
                              </svg>
                            </button>
                            <button className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}