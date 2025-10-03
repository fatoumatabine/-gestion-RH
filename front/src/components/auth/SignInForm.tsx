import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { loginSchema, type LoginFormData } from "../../lib/validationSchemas";
import { ZodError } from "zod";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    })); 
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    try {
      // Validation avec Zod
      const validatedData = loginSchema.parse(formData);

      // Utilisation du contexte d'authentification
      await login(validatedData.email, validatedData.password);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ZodError) {
        // Erreurs de validation Zod
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (field === 'email') {
            fieldErrors[field] = 'Veuillez saisir une adresse email valide';
          } else if (field === 'password') {
            fieldErrors[field] = 'Le mot de passe est requis';
          } else {
            fieldErrors[field] = issue.message;
          }
        });
        setFieldErrors(fieldErrors);
      } else {
        // Erreur API
        const message = err instanceof Error ? err.message : 'Une erreur est survenue';
        if (message.includes('401') || message.includes('incorrect')) {
          setError('Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.');
        } else if (message.includes('réseau') || message.includes('serveur')) {
          setError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
        } else {
          setError('Une erreur est survenue lors de la connexion.');
        }
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header with back link */}


      {/* Main card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
        {/* Header section */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connexion
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Accédez à votre espace de gestion RH
          </p>
        </div>

        {/* Form section */}
        <div className="px-8 pb-8">

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Adresse email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  placeholder=""
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!fieldErrors.email}
                  hint={fieldErrors.email}
                  className="pl-4 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500 focus:scale-[1.02] transform"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!fieldErrors.password}
                  hint={fieldErrors.password}
                  className="pl-4 pr-12 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500 focus:scale-[1.02] transform"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-xl transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  checked={isChecked}
                  onChange={setIsChecked}
                  className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Se souvenir de moi
                </span>
              </div>
              <Link
                to="/reset-password"
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors duration-200"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous n'avez pas de compte ?{" "}
              <Link
                to="/auth/sign-up"
                className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          En vous connectant, vous acceptez nos{" "}
          <Link to="/terms" className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
            conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link to="/privacy" className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
            politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  );
}


