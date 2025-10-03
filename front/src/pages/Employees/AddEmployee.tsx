import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { employeesService, CreateEmployeeData } from "../../services/employees";
import { employeeSchema, EmployeeFormData } from "../../lib/validationSchemas";
import Label from "../../components/form/Label";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      userId: undefined,
      entrepriseId: undefined,
      department: "",
      position: "",
      salary: undefined,
      hireDate: "",
      phone: "",
      address: "",
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

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Build transformed data, only including optional fields if they have values
      const transformedData: CreateEmployeeData = {
        userId: Number(data.userId),
        entrepriseId: Number(data.entrepriseId),
      };

      if (data.hireDate) {
        transformedData.hireDate = new Date(data.hireDate).toISOString();
      }

      if (data.salary !== undefined) {
        transformedData.salary = Number(data.salary);
      }

      if (data.phone) {
        transformedData.phone = data.phone;
      }

      if (data.address) {
        transformedData.address = data.address;
      }

      if (data.department) {
        transformedData.department = data.department;
      }

      if (data.position) {
        transformedData.position = data.position;
      }

      await employeesService.createEmployee(transformedData);
      navigate("/employees");
    } catch (err) {
      console.error("Error creating employee:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'employé");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Ajouter un Employé | Gestion RH"
        description="Ajouter un nouvel employé au système"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Ajouter un Employé
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Créer un nouveau profil employé
            </p>
          </div>
          <button
            onClick={() => navigate("/employees")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Retour à la liste
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="userId">ID Utilisateur *</Label>
                <input
                  type="number"
                  id="userId"
                  {...register("userId", { valueAsNumber: true })}
                  placeholder="Entrez l'ID utilisateur"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                {errors.userId && (
                  <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="entrepriseId">ID Entreprise *</Label>
                <input
                  type="number"
                  id="entrepriseId"
                  {...register("entrepriseId", { valueAsNumber: true })}
                  placeholder="Entrez l'ID entreprise"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                {errors.entrepriseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.entrepriseId.message}</p>
                )}
              </div>


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
                <Label htmlFor="salary">Salaire</Label>
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
                <Label htmlFor="hireDate">Date d'embauche</Label>
                <input
                  type="date"
                  id="hireDate"
                  {...register("hireDate")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                {errors.hireDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.hireDate.message}</p>
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
                {isSubmitting ? "Création..." : "Créer l'employé"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}