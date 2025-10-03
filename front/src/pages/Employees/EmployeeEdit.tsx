import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { employeesService, Employee, UpdateEmployeeData } from "../../services/employees";
import { usersService } from "../../services/users";
import { useToast } from "../../context/ToastContext";
import Label from "../../components/form/Label";

export default function EmployeeEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateEmployeeData>({
    defaultValues: {
      department: "",
      position: "",
      salary: undefined,
      phone: "",
      address: "",
      status: "ACTIVE",
    },
  });

  const departmentOptions = [
    { value: "IT", label: "Informatique" },
    { value: "HR", label: "Ressources Humaines" },
    { value: "Finance", label: "Finance" },
    { value: "Marketing", label: "Marketing" },
    { value: "Operations", label: "Opérations" },
  ];

  const positionOptions = [
    { value: "Developer", label: "Développeur" },
    { value: "Manager", label: "Manager" },
    { value: "Analyst", label: "Analyste" },
    { value: "Designer", label: "Designer" },
    { value: "Consultant", label: "Consultant" },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: "Actif" },
    { value: "INACTIVE", label: "Inactif" },
    { value: "TERMINATED", label: "Terminé" },
  ];

  useEffect(() => {
    const loadEmployee = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const employeeData = await employeesService.getEmployeeById(parseInt(id));
        setEmployee(employeeData);

        // Pré-remplir le formulaire avec les données existantes
        setValue("department", employeeData.department || "");
        setValue("position", employeeData.position || "");
        setValue("salary", employeeData.salary);
        setValue("phone", employeeData.phone || "");
        setValue("address", employeeData.address || "");
        setValue("status", employeeData.status);
      } catch (err) {
        console.error("Error loading employee:", err);
        setError("Erreur lors du chargement de l'employé");
        showError("Erreur", "Impossible de charger les données de l'employé");
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id, setValue, showError]);

  const onSubmit = async (data: UpdateEmployeeData) => {
    if (!id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Transformer les données pour l'API
      const transformedData: UpdateEmployeeData = {};

      if (data.department !== undefined) transformedData.department = data.department;
      if (data.position !== undefined) transformedData.position = data.position;
      if (data.salary !== undefined) transformedData.salary = Number(data.salary);
      if (data.phone !== undefined) transformedData.phone = data.phone;
      if (data.address !== undefined) transformedData.address = data.address;
      if (data.status !== undefined) transformedData.status = data.status;

      await employeesService.updateEmployee(parseInt(id), transformedData);
      showSuccess("Succès", "Employé modifié avec succès");
      navigate("/employees");
    } catch (err) {
      console.error("Error updating employee:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la modification de l'employé";
      setError(errorMessage);
      showError("Erreur", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de l'employé...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Employé non trouvé</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">L'employé demandé n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => navigate("/employees")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Modifier ${employee.user?.firstName} ${employee.user?.lastName} | Gestion RH`}
        description="Modifier les informations d'un employé"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Modifier l'Employé
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Modifier les informations de {employee.user?.firstName} {employee.user?.lastName}
            </p>
          </div>
          <button
            onClick={() => navigate("/employees")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Retour à la liste
          </button>
        </div>

        {/* Informations de l'employé */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations actuelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {employee.user ? `${employee.user.firstName.charAt(0)}${employee.user.lastName.charAt(0)}` : employee.employeeId.slice(0, 2)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {employee.user?.firstName} {employee.user?.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {employee.employeeId}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {employee.user?.email || 'Non défini'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Entreprise</p>
              <p className="font-medium text-gray-900 dark:text-white">
                Entreprise {employee.entrepriseId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Statut actuel</p>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                employee.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {employee.status === 'ACTIVE' ? 'Actif' :
                 employee.status === 'INACTIVE' ? 'Inactif' : 'Terminé'}
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire de modification */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="department">Département</Label>
                <select
                  id="department"
                  {...register("department")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Sélectionnez un département</option>
                  {departmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="position">Poste</Label>
                <select
                  id="position"
                  {...register("position")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Sélectionnez un poste</option>
                  {positionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="salary">Salaire (XOF)</Label>
                <input
                  type="number"
                  id="salary"
                  {...register("salary", { valueAsNumber: true })}
                  placeholder="Entrez le salaire"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <input
                  type="tel"
                  id="phone"
                  {...register("phone")}
                  placeholder="Entrez le numéro de téléphone"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <input
                  type="text"
                  id="address"
                  {...register("address")}
                  placeholder="Entrez l'adresse"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/employees")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Modification..." : "Modifier l'employé"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}