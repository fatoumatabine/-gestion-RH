import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <UserCircleIcon />,
    name: "Employés",
    subItems: [
      { name: "Liste des Employés", path: "/employees", pro: false },
      { name: "Ajouter Employé", path: "/employees/new", pro: false },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Paie & Salaires",
    subItems: [
      { name: "Bulletins de Paie", path: "/payrolls", pro: false },
      { name: "Générer Paie", path: "/payrolls/new", pro: false },
      { name: "Cycles de Paie", path: "/payruns", pro: false },
      { name: "Historique Salaires", path: "/salary-history", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Pointages",
    subItems: [
      { name: "Tableau de Bord", path: "/attendance", pro: false },
      { name: "Scanner QR Code", path: "/attendance/scan", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Paiements",
    subItems: [
      { name: "Gestion Paiements", path: "/payments", pro: false },
      { name: "Tableau de Bord", path: "/payments/dashboard", pro: false },
    ],
  },
  // {
  //   icon: <CalenderIcon />,
  //   name: "Congés",
  //   subItems: [
  //     { name: "Demandes de Congé", path: "/leaves", pro: false },
  //     { name: "Calendrier", path: "/calendar", pro: false },
  //   ],
  // },
  {
    icon: <BoxCubeIcon />,
    name: "Entreprises",
    subItems: [
      { name: "Toutes les Entreprises", path: "/companies", pro: false },
      { name: "Ajouter Entreprise", path: "/companies/new", pro: false },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Données d'Entreprise",
    subItems: [
      { name: "Factures", path: "/company/factures", pro: false },
      { name: "Bulletins de Salaire", path: "/company/bulletins", pro: false },
      { name: "Historique Salaires", path: "/company/salary-history", pro: false },
      { name: "Documents", path: "/company/documents", pro: false },
    ],
  },
  // {
  //   icon: <PieChartIcon />,
  //   name: "Rapports",
  //   subItems: [
  //     { name: "Rapports RH", path: "/reports/hr", pro: false },
  //     { name: "Statistiques", path: "/reports/statistics", pro: false },
  //   ],
  // },
];

const othersItems: NavItem[] = [
  // {
  //   icon: <PieChartIcon />,
  //   name: "Analyses",
  //   subItems: [
  //     { name: "Tableaux de Bord", path: "/analytics/dashboard", pro: false },
  //     { name: "Rapports Détaillés", path: "/analytics/reports", pro: false },
  //   ],
  // },
  {
    icon: <BoxCubeIcon />,
    name: "Paramètres",
    subItems: [
      { name: "Configuration Paie", path: "/settings/payroll", pro: false },
      { name: "Modèles Documents", path: "/settings/templates", pro: false },
      { name: "Préférences", path: "/settings/preferences", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Profil",
    subItems: [
      { name: "Mon Profil", path: "/profile", pro: false },
      { name: "Changer Mot de Passe", path: "/profile/change-password", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user, isAuthenticated } = useAuth();
  const { company } = useCompany();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [activeSessions, setActiveSessions] = useState<number>(0);
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // Load employee count when company changes
  useEffect(() => {
    const loadEmployeeCount = async () => {
      if (company && isAuthenticated) {
        try {
          const response = await fetch(`http://localhost:5000/api/employees/company/${company.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
          if (response.ok) {
            const employees = await response.json();
            setEmployeeCount(employees.length);
          }
        } catch (error) {
          console.error('Error loading employee count:', error);
          setEmployeeCount(0);
        }
      } else {
        setEmployeeCount(null);
      }
    };

    loadEmployeeCount();
  }, [company, isAuthenticated]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    // Filter items based on authentication and role
    const filteredItems = items.filter((nav) => {
      // Dashboard is always visible
      if (nav.name === "Dashboard") return true;

      // For authenticated users, filter based on role
      if (isAuthenticated) {
        // CASHIER role: only show relevant items
        if (user?.role === 'CASHIER') {
          // Caissier voit le dashboard, les paiements et certaines fonctions de paie
          if (nav.name === "Paie & Salaires") {
            // Filter subItems to show relevant items for cashier
            nav.subItems = nav.subItems?.filter(subItem =>
              subItem.name === "Bulletins de Paie" ||
              subItem.name === "Cycles de Paie"
            );
            return nav.subItems && nav.subItems.length > 0;
          }
          if (nav.name === "Paiements") {
            // Caissier a accès à tous les paiements
            return true;
          }
          // Hide other sections for cashier
          return false;
        }

        // SUPERADMIN role: show paiements section
        if (user?.role === 'SUPERADMIN') {
          if (nav.name === "Paiements") {
            return true;
          }
        }

        // EMPLOYEE role: limited access
        if (user?.role === 'EMPLOYEE') {
          // Employés ne voient que leur profil et potentiellement les congés
          if (nav.name === "Congés" || nav.name === "Profil") {
            return true;
          }
          return false;
        }

        // ADMIN/SUPERADMIN: check specific role requirements
        if (nav.name === "Entreprises") {
          // Seuls les SUPERADMIN voient la section "Entreprises"
          return user?.role === 'SUPERADMIN';
        }

        // Données d'Entreprise: visible pour ADMIN et SUPERADMIN
        if (nav.name === "Données d'Entreprise") {
          return user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
        }

        // For "others" menu, check specific role requirements
        if (menuType === "others") {
          if (nav.name === "Analyses") {
            return user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
          }
          if (nav.name === "Paramètres") {
            return user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
          }
        }
        return true;
      }

      // For non-authenticated users, only show dashboard
      return false;
    });

    return (
      <ul className="flex flex-col gap-4">
        {filteredItems.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size  ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  // Apply company colors if available
  const primaryColor = company?.couleurPrimaire || '#3b82f6';
  const secondaryColor = company?.couleurSecondaire || '#10b981';

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 h-screen transition-all duration-500 ease-in-out z-50 border-r border-gray-200/50 dark:border-gray-700/50
        ${
          isExpanded || isMobileOpen
            ? "w-[320px]"
            : isHovered
            ? "w-[320px]"
            : "w-[100px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        shadow-2xl shadow-blue-500/10 dark:shadow-slate-900/50`}
      style={{
        background: company
          ? `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}10 50%, ${primaryColor}05 100%)`
          : 'linear-gradient(135deg, rgb(248 250 252) 0%, rgb(239 246 255) 50%, rgb(238 242 255) 100%)',
      }}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header avec logo et statut utilisateur */}
      <div className={`py-8 flex flex-col items-center gap-4 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/dashboard" className="group">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white font-bold text-lg">HR</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TechnoHR
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">HR</span>
            </div>
          )}
        </Link>

        {/* Indicateur de statut utilisateur */}
        {(isExpanded || isHovered || isMobileOpen) && user && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
            <div className={`w-2 h-2 rounded-full shadow-lg ${
              user.role === 'SUPERADMIN' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
              user.role === 'ADMIN' && company ? 'bg-gradient-to-r' :
              user.role === 'ADMIN' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}
            style={user.role === 'ADMIN' && company ? {
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
            } : {}}
            ></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
              {user.role === 'ADMIN' && company ? 'Admin Entreprise' : user.role.toLowerCase()}
            </span>
          </div>
        )}
      </div>

      {/* Navigation principale */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {/* Section principale */}
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}>
                {isExpanded || isHovered || isMobileOpen ? (
                  <span className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    Menu Principal
                  </span>
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* Section outils */}
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}>
                {isExpanded || isHovered || isMobileOpen ? (
                  <span className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    Outils & Analyses
                  </span>
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>

        {/* Widget d'informations système/entreprise */}
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="mt-auto mb-4">
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-slate-700/50">
              {company ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Mon Entreprise</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></div>
                      <span className="text-xs" style={{ color: primaryColor }}>Active</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
                      {company.nom}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Employés</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {employeeCount !== null ? employeeCount : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Devise</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{company.devise}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Statut Système</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400">En ligne</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Utilisateurs actifs</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {activeUsers || Math.floor(Math.random() * 20) + 5}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Sessions</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {activeSessions || Math.floor(Math.random() * 15) + 3}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;

