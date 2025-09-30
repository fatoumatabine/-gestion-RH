import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { employeesService } from "../../services/employees";
import { employeeSchema, EmployeeFormData } from "../../lib/validationSchemas";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";

export default function AddEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      entrepriseId: user?.id || 1, // Assuming entrepriseId is user's company, default to 1
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
      await employeesService.createEmployee(data);
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
          <Button
            onClick={() => navigate("/employees")}
            variant="outline"
          >
            Retour à la liste
          </Button>
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
                <Input
                  type="number"
                  id="userId"
                  {...register("userId", { valueAsNumber: true })}
                  placeholder="Entrez l'ID utilisateur"
                />
                {errors.userId && (
                  <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="entrepriseId">ID Entreprise *</Label>
                <Input
                  type="number"
                  id="entrepriseId"
                  {...register("entrepriseId", { valueAsNumber: true })}
                  placeholder="Entrez l'ID entreprise"
                />
                {errors.entrepriseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.entrepriseId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="employeeId">ID Employé *</Label>
                <Input
                  type="text"
                  id="employeeId"
                  {...register("employeeId")}
                  placeholder="Entrez l'ID employé"
                />
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>
                )}
              </div>

              <div>
                <Label>Département</Label>
                <Select
                  options={departmentOptions}
                  placeholder="Sélectionnez un département"
                  onChange={(value) => setValue("department", value)}
                  className="dark:bg-dark-900"
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>

              <div>
                <Label>Poste</Label>
                <Select
                  options={positionOptions}
                  placeholder="Sélectionnez un poste"
                  onChange={(value) => setValue("position", value)}
                  className="dark:bg-dark-900"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="salary">Salaire</Label>
                <Input
                  type="number"
                  id="salary"
                  {...register("salary", { valueAsNumber: true })}
                  placeholder="Entrez le salaire"
                />
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="hireDate">Date d'embauche</Label>
                <Input
                  type="date"
                  id="hireDate"
                  {...register("hireDate")}
                />
                {errors.hireDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.hireDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  type="tel"
                  id="phone"
                  {...register("phone")}
                  placeholder="Entrez le numéro de téléphone"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  type="text"
                  id="address"
                  {...register("address")}
                  placeholder="Entrez l'adresse"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/employees")}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création..." : "Créer l'employé"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}