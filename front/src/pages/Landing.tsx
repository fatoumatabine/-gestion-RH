import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaRocket,
  FaUsers,
  FaChartLine,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaBuilding,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaUserCheck,
  FaCog,
  FaPlay,
  FaGlobe,
  FaAward,
} from 'react-icons/fa';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const features = [
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Gestion des Employés",
      description: "Gérez facilement les informations, contrats et performances de vos employés.",
      image: "/images/grid-image/image-02.png"
    },
    {
      icon: <FaMoneyBillWave className="w-8 h-8" />,
      title: "Paie & Salaires",
      description: "Automatisez les calculs de salaire, générez les bulletins et gérez les cycles de paie.",
      image: "/images/grid-image/image-03.png"
    },
    {
      icon: <FaCalendarAlt className="w-8 h-8" />,
      title: "Gestion des Congés",
      description: "Suivez les demandes de congé, planifiez les absences et maintenez la productivité.",
      image: "/images/grid-image/image-04.png"
    },
    {
      icon: <FaFileInvoiceDollar className="w-8 h-8" />,
      title: "Facturation",
      description: "Créez et gérez les factures, suivez les paiements et optimisez vos revenus.",
      image: "/images/grid-image/image-05.png"
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Rapports & Analyses",
      description: "Obtenez des insights précieux avec des rapports détaillés et des tableaux de bord.",
      image: "/images/grid-image/image-06.png"
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: "Sécurité & Conformité",
      description: "Données sécurisées, conformité RGPD et contrôles d'accès avancés.",
      image: "/images/grid-image/image-01.png"
    }
  ];

  const stats = [
    { number: "500+", label: "Entreprises", icon: <FaBuilding className="w-6 h-6" /> },
    { number: "10K+", label: "Employés Gérés", icon: <FaUsers className="w-6 h-6" /> },
    { number: "99.9%", label: "Disponibilité", icon: <FaGlobe className="w-6 h-6" /> },
    { number: "24/7", label: "Support", icon: <FaAward className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo/logo.svg"
              alt="TechnoHR Logo"
              className="w-12 h-12"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                TechnoHR
              </h3>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/auth/sign-in"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/auth/sign-up"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-lg"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Video Header */}
      <section className="relative px-6 py-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Animated Video Header */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>

          {/* Animated Image Carousel */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="relative w-full h-full overflow-hidden">
              {/* Image 1 */}
              <div className="absolute inset-0 animate-slide-show-1">
                <img
                  src="/images/concept-de-controle-qualite-standard-m.jpg"
                  alt="Qualité et contrôle"
                  className="w-full h-full object-cover opacity-20 animate-zoom-slow"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent animate-gradient-shift"></div>
              </div>

              {/* Image 2 */}
              <div className="absolute inset-0 animate-slide-show-2">
                <img
                  src="/images/concept-de-controle-qualite-standard-m (1).jpg"
                  alt="Contrôle qualité avancé"
                  className="w-full h-full object-cover opacity-20 animate-zoom-slow animation-delay-2000"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-purple-500/20 to-transparent animate-gradient-shift animation-delay-2000"></div>
              </div>

              {/* Image 3 */}
              <div className="absolute inset-0 animate-slide-show-3">
                <img
                  src="/images/concept-de-controle-qualite-standard-m (2).jpg"
                  alt="Standards qualité"
                  className="w-full h-full object-cover opacity-20 animate-zoom-slow animation-delay-4000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent animate-gradient-shift animation-delay-4000"></div>
              </div>

              {/* Image 4 */}
              <div className="absolute inset-0 animate-slide-show-4">
                <img
                  src="/images/statistiques-de-cooperation-personnes-financieres-professionnelles.jpg"
                  alt="Statistiques et coopération"
                  className="w-full h-full object-cover opacity-20 animate-zoom-slow animation-delay-6000"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 to-transparent animate-gradient-shift animation-delay-6000"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full animate-float opacity-70 shadow-lg shadow-blue-200/50"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-lg animate-float-delayed opacity-60 shadow-lg shadow-purple-200/50"></div>
          <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-green-200 rounded-full animate-float-slow opacity-50 shadow-lg shadow-green-200/50"></div>
          <div className="absolute top-60 right-1/3 w-24 h-8 bg-yellow-200 rounded-full animate-float-reverse opacity-40 shadow-lg shadow-yellow-200/50"></div>
          <div className="absolute bottom-20 right-10 w-18 h-18 bg-pink-200 rounded-lg animate-float-fast opacity-60 shadow-lg shadow-pink-200/50"></div>

          {/* Dynamic Geometric Shapes */}
          <div className="absolute top-32 left-1/3 w-8 h-8 bg-blue-300 rotate-45 animate-spin-slow opacity-80 shadow-lg shadow-blue-300/50"></div>
          <div className="absolute bottom-32 right-1/4 w-10 h-10 bg-purple-300 rounded-full animate-pulse opacity-70 shadow-lg shadow-purple-300/50"></div>
          <div className="absolute top-1/2 left-20 w-6 h-6 bg-green-300 rotate-12 animate-bounce-slow opacity-90 shadow-lg shadow-green-300/50"></div>
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-orange-300 rounded-full animate-ping opacity-60"></div>

          {/* Advanced Particle System */}
          <div className="absolute top-16 right-16 w-3 h-3 bg-blue-400 rounded-full animate-particle-1 shadow-lg shadow-blue-400/50"></div>
          <div className="absolute top-24 left-16 w-2 h-2 bg-purple-400 rounded-full animate-particle-2 shadow-lg shadow-purple-400/50"></div>
          <div className="absolute bottom-16 right-32 w-4 h-4 bg-green-400 rounded-full animate-particle-3 shadow-lg shadow-green-400/50"></div>
          <div className="absolute bottom-24 left-32 w-3 h-3 bg-yellow-400 rounded-full animate-particle-4 shadow-lg shadow-yellow-400/50"></div>
          <div className="absolute top-1/3 right-8 w-2 h-2 bg-pink-400 rounded-full animate-particle-5 shadow-lg shadow-pink-400/50"></div>
          <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-particle-6 shadow-lg shadow-indigo-400/50"></div>
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-teal-400 rounded-full animate-particle-7 shadow-lg shadow-teal-400/50"></div>

          {/* Animated Wave Background */}
          <div className="absolute bottom-0 left-0 w-full h-40">
            <svg viewBox="0 0 1200 120" className="absolute bottom-0 w-full h-full">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(59 130 246 / 0.1)" />
                  <stop offset="50%" stopColor="rgb(147 51 234 / 0.1)" />
                  <stop offset="100%" stopColor="rgb(59 130 246 / 0.1)" />
                </linearGradient>
              </defs>
              <path d="M0,60 C300,100 600,20 900,60 C1050,80 1200,40 1200,60 L1200,120 L0,120 Z" fill="url(#waveGradient)" className="animate-wave"></path>
              <path d="M0,80 C250,120 550,40 850,80 C1000,100 1150,60 1150,80 L1150,120 L0,120 Z" fill="url(#waveGradient)" className="animate-wave-reverse opacity-50"></path>
            </svg>
          </div>

          {/* Floating Text Elements */}
          <div className="absolute top-1/4 left-1/4 text-blue-600/20 text-6xl font-bold animate-float-slow select-none pointer-events-none">
            TECHNO
          </div>
          <div className="absolute bottom-1/4 right-1/4 text-purple-600/20 text-5xl font-bold animate-float-reverse select-none pointer-events-none">
            HR
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 mb-8 animate-pulse-slow shadow-lg">
                <FaRocket className="w-4 h-4 text-blue-600 animate-bounce" />
                <span className="text-sm font-medium text-blue-700">
                  Révolutionnez votre gestion RH
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up animation-delay-200 drop-shadow-lg">
                Système de Gestion
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-slide-in-left animation-delay-400">
                  RH Intelligent
                </span>
              </h1>

              <p className="text-xl text-gray-700 mb-8 leading-relaxed animate-fade-in-up animation-delay-600 drop-shadow-sm">
                Simplifiez la gestion de vos ressources humaines avec notre plateforme moderne.
                Automatisez les processus, améliorez la productivité et prenez des décisions éclairées.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up animation-delay-800">
                <Link
                  to="/auth/sign-up"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 animate-pulse-slow"
                >
                  Commencer Gratuitement
                  <FaArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/auth/sign-in"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all hover:scale-105 backdrop-blur-sm bg-white/50"
                >
                  Se Connecter
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-sm text-gray-600 animate-fade-in-up animation-delay-1000">
                <div className="flex items-center gap-2 animate-slide-in-left animation-delay-1200 bg-white/60 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <FaCheckCircle className="w-4 h-4 text-green-500 animate-pulse" />
                  <span>Essai gratuit de 30 jours</span>
                </div>
                <div className="flex items-center gap-2 animate-slide-in-left animation-delay-1400 bg-white/60 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <FaCheckCircle className="w-4 h-4 text-green-500 animate-pulse animation-delay-200" />
                  <span>Pas de carte de crédit requise</span>
                </div>
                <div className="flex items-center gap-2 animate-slide-in-left animation-delay-1600 bg-white/60 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <FaCheckCircle className="w-4 h-4 text-green-500 animate-pulse animation-delay-400" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in-right animation-delay-600">
              <div className="relative">
                <img
                  src="/images/carousel/carousel-01.png"
                  alt="TechnoHR Dashboard"
                  className="w-full h-auto rounded-2xl shadow-2xl animate-float-slow border border-white/50 backdrop-blur-sm"
                />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce-slow shadow-xl border-4 border-white">
                  <FaPlay className="w-8 h-8 text-white animate-pulse" />
                </div>
                {/* Enhanced floating elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-float opacity-90 shadow-xl"></div>
                <div className="absolute top-1/2 -left-8 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg animate-float-delayed opacity-80 shadow-xl"></div>
                <div className="absolute bottom-1/4 -right-8 w-6 h-6 bg-gradient-to-r from-green-400 to-teal-400 rounded-full animate-float-reverse opacity-70 shadow-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            @keyframes float-delayed {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-15px); }
            }
            @keyframes float-slow {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-10px) rotate(5deg); }
            }
            @keyframes float-reverse {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(15px); }
            }
            @keyframes float-fast {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-25px); }
            }
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes bounce-slow {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
            @keyframes particle-1 {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
              50% { transform: translateY(-100px) translateX(50px); opacity: 1; }
            }
            @keyframes particle-2 {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
              50% { transform: translateY(-80px) translateX(-30px); opacity: 1; }
            }
            @keyframes particle-3 {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
              50% { transform: translateY(60px) translateX(-40px); opacity: 1; }
            }
            @keyframes particle-4 {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
              50% { transform: translateY(40px) translateX(60px); opacity: 1; }
            }
            @keyframes particle-5 {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
              50% { transform: translateY(-60px) translateX(20px); opacity: 1; }
            }
            @keyframes particle-6 {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
              50% { transform: translateY(-120px) translateX(-60px); opacity: 1; }
            }
            @keyframes particle-7 {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
              50% { transform: translateY(80px) translateX(80px); opacity: 1; }
            }
            @keyframes wave {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(-25px); }
            }
            @keyframes wave-reverse {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(25px); }
            }
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fade-in-right {
              from { opacity: 0; transform: translateX(30px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slide-in-left {
              from { opacity: 0; transform: translateX(-30px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes pulse-slow {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            @keyframes zoom-slow {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            @keyframes gradient-shift {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 0.7; }
            }
            @keyframes slide-show-1 {
              0% { opacity: 1; z-index: 1; }
              25% { opacity: 1; z-index: 1; }
              25.1% { opacity: 0; z-index: 0; }
              100% { opacity: 0; z-index: 0; }
            }
            @keyframes slide-show-2 {
              0% { opacity: 0; z-index: 0; }
              25% { opacity: 0; z-index: 0; }
              25.1% { opacity: 1; z-index: 1; }
              50% { opacity: 1; z-index: 1; }
              50.1% { opacity: 0; z-index: 0; }
              100% { opacity: 0; z-index: 0; }
            }
            @keyframes slide-show-3 {
              0% { opacity: 0; z-index: 0; }
              50% { opacity: 0; z-index: 0; }
              50.1% { opacity: 1; z-index: 1; }
              75% { opacity: 1; z-index: 1; }
              75.1% { opacity: 0; z-index: 0; }
              100% { opacity: 0; z-index: 0; }
            }
            @keyframes slide-show-4 {
              0% { opacity: 0; z-index: 0; }
              75% { opacity: 0; z-index: 0; }
              75.1% { opacity: 1; z-index: 1; }
              100% { opacity: 1; z-index: 1; }
            }

            .animate-float { animation: float 6s ease-in-out infinite; }
            .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; animation-delay: 2s; }
            .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
            .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; animation-delay: 1s; }
            .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
            .animate-spin-slow { animation: spin-slow 20s linear infinite; }
            .animate-bounce-slow { animation: bounce-slow 3s infinite; }
            .animate-particle-1 { animation: particle-1 8s ease-in-out infinite; }
            .animate-particle-2 { animation: particle-2 6s ease-in-out infinite; animation-delay: 1s; }
            .animate-particle-3 { animation: particle-3 7s ease-in-out infinite; animation-delay: 2s; }
            .animate-particle-4 { animation: particle-4 9s ease-in-out infinite; animation-delay: 0.5s; }
            .animate-particle-5 { animation: particle-5 5s ease-in-out infinite; animation-delay: 1.5s; }
            .animate-particle-6 { animation: particle-6 10s ease-in-out infinite; animation-delay: 0.8s; }
            .animate-particle-7 { animation: particle-7 7s ease-in-out infinite; animation-delay: 2.5s; }
            .animate-wave { animation: wave 10s ease-in-out infinite; }
            .animate-wave-reverse { animation: wave-reverse 12s ease-in-out infinite; animation-delay: 1s; }
            .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; opacity: 0; }
            .animate-fade-in-right { animation: fade-in-right 1s ease-out forwards; opacity: 0; }
            .animate-slide-in-left { animation: slide-in-left 1s ease-out forwards; opacity: 0; }
            .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            .animate-zoom-slow { animation: zoom-slow 15s ease-in-out infinite; }
            .animate-gradient-shift { animation: gradient-shift 8s ease-in-out infinite; }
            .animate-slide-show-1 { animation: slide-show-1 16s ease-in-out infinite; }
            .animate-slide-show-2 { animation: slide-show-2 16s ease-in-out infinite; }
            .animate-slide-show-3 { animation: slide-show-3 16s ease-in-out infinite; }
            .animate-slide-show-4 { animation: slide-show-4 16s ease-in-out infinite; }
            .animation-delay-200 { animation-delay: 0.2s; }
            .animation-delay-400 { animation-delay: 0.4s; }
            .animation-delay-600 { animation-delay: 0.6s; }
            .animation-delay-800 { animation-delay: 0.8s; }
            .animation-delay-1000 { animation-delay: 1s; }
            .animation-delay-1200 { animation-delay: 1.2s; }
            .animation-delay-1400 { animation-delay: 1.4s; }
            .animation-delay-1600 { animation-delay: 1.6s; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }
            .animation-delay-6000 { animation-delay: 6s; }
          `
        }} />
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités Puissantes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement vos ressources humaines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600">{stat.icon}</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à Transformer Votre Gestion RH ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'entreprises qui font confiance à TechnoHR
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/sign-up"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Créer Mon Compte
              <FaArrowRight className="inline ml-2 w-4 h-4" />
            </Link>

            <Link
              to="/auth/sign-in"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all"
            >
              Connexion
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">HR</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">TechnoHR</h3>
                  <p className="text-sm text-gray-400">Management System</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                La solution moderne pour la gestion des ressources humaines.
                Simplifiez vos processus RH avec notre plateforme intuitive.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TechnoHR. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;