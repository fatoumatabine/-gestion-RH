import React from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Image */}
     

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <div className="relative flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 p-12 items-center justify-center relative overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
            style={{
              backgroundImage: `url('/images/phottt.png')`
            }}
          />

          {/* Background overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink/80 via-red/60 to-red/80" />

          {/* Decorative elements */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/5 rounded-full blur-3xl" />

          <div className="relative z-10 text-center text-black max-w-md">
          

            {/* Main heading */}
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Employee Management System
            
            </h1>

            {/* Description */}
            <p className="text-lg text-black-100 leading-relaxed mb-8">
              Gérez efficacement vos employés, entreprises et ressources humaines avec notre plateforme moderne et sécurisée.
            </p>

           

           
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Theme Toggler */}
        <div className="fixed z-50 bottom-6 right-6">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
