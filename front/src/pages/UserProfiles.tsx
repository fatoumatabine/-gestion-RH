import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";

export default function UserProfiles() {
  const { user, logout } = useAuth();
  const { showError, showInfo } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Veuillez vous connecter pour accéder à votre profil.
          </p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'from-purple-500 to-pink-500';
      case 'ADMIN':
        return 'from-blue-500 to-cyan-500';
      case 'CASHIER':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleStats = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return [
          { label: 'Entreprises gérées', value: '12', icon: '🏢' },
          { label: 'Utilisateurs actifs', value: '156', icon: '👥' },
          { label: 'Sessions aujourd\'hui', value: '89', icon: '📊' },
          { label: 'Taux de satisfaction', value: '98%', icon: '⭐' },
        ];
      case 'ADMIN':
        return [
          { label: 'Employés supervisés', value: '24', icon: '👨‍💼' },
          { label: 'Bulletins générés', value: '156', icon: '📄' },
          { label: 'Congés approuvés', value: '23', icon: '📅' },
          { label: 'Tâches complétées', value: '94%', icon: '✅' },
        ];
      case 'CASHIER':
        return [
          { label: 'Transactions traitées', value: '1,247', icon: '💰' },
          { label: 'Paiements validés', value: '892', icon: '✅' },
          { label: 'Temps de réponse', value: '< 2min', icon: '⚡' },
          { label: 'Satisfaction client', value: '96%', icon: '😊' },
        ];
      default:
        return [];
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showError("Erreur de validation", "Les mots de passe ne correspondent pas");
      return;
    }
    // TODO: Implement password change API call
    showInfo("Information", "Fonctionnalité de changement de mot de passe en développement");
  };

  return (
    <>
      <PageMeta
        title="Mon Profil | Gestion RH"
        description="Gérez votre profil et vos paramètres personnels"
      />
      <PageBreadcrumb pageTitle="Mon Profil" />

      <div className="space-y-6">
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl font-bold text-white">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${getRoleColor(user.role)}`}></span>
                    {user.role === 'SUPERADMIN' ? 'Super Administrateur' :
                     user.role === 'ADMIN' ? 'Administrateur' : 'Caissier'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {user.email}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Déconnexion
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Role Based */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getRoleStats(user.role).map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              {[
                { id: 'profile', label: 'Informations', icon: '👤' },
                { id: 'security', label: 'Sécurité', icon: '🔐' },
                { id: 'preferences', label: 'Préférences', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Prénom</Label>
                      <Input
                        value={user.firstName || ''}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                      />
                    </div>
                    <div>
                      <Label>Nom</Label>
                      <Input
                        value={user.lastName || ''}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={user.email}
                        disabled
                        className="bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <Label>Téléphone</Label>
                      <Input
                        value=""
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                        placeholder="Non disponible"
                      />
                    </div>
                  </div>
                </div>

                {user.role !== 'SUPERADMIN' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Informations professionnelles
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Informations sur votre poste et entreprise disponibles dans la section Employés.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Changer le mot de passe
                  </h3>
                  <div className="max-w-md space-y-4">
                    <div>
                      <Label>Mot de passe actuel</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Votre mot de passe actuel"
                      />
                    </div>
                    <div>
                      <Label>Nouveau mot de passe</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 caractères"
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
                    <Button onClick={handlePasswordChange} className="w-full">
                      Mettre à jour le mot de passe
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Sécurité du compte
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Authentification à deux facteurs</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ajoutez une couche de sécurité supplémentaire</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Configurer
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Sessions actives</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gérez vos sessions connectées</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Voir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Préférences d'affichage
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Thème sombre</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Basculer entre thème clair et sombre</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Activer
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gérer vos préférences de notifications</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Configurer
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Langue et région
                  </h3>
                  <div className="max-w-md">
                    <Label>Langue</Label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
