import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useAuth } from "../../context/AuthContext";

export default function ChangePassword() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual password change API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setMessage("Mot de passe mis à jour avec succès !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage("Erreur lors du changement de mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Changer Mot de Passe | Gestion RH"
        description="Modifier votre mot de passe pour plus de sécurité"
      />
      <PageBreadcrumb pageTitle="Changer le Mot de Passe" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xl">🔐</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sécurité du compte
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Mettez à jour votre mot de passe régulièrement pour maintenir la sécurité
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Changer le mot de passe
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connecté en tant que <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Mot de passe actuel</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                />
              </div>
              <div>
                <Label>Confirmer le mot de passe</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le nouveau mot de passe"
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Exigences du mot de passe :
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                  <span className={newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}>✓</span>
                  Au moins 8 caractères
                </li>
                <li className={`flex items-center gap-2 ${newPassword === confirmPassword && newPassword ? 'text-green-600' : ''}`}>
                  <span className={newPassword === confirmPassword && newPassword ? 'text-green-500' : 'text-gray-400'}>✓</span>
                  Les mots de passe correspondent
                </li>
              </ul>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('succès')
                  ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                  : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mise à jour...
                  </div>
                ) : (
                  'Mettre à jour le mot de passe'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">💡</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Conseils de sécurité
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Utilisez un mot de passe unique et complexe</li>
                <li>• Évitez de réutiliser des mots de passe anciens</li>
                <li>• Activez l'authentification à deux facteurs si disponible</li>
                <li>• Changez votre mot de passe régulièrement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}