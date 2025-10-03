import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Company {
  id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  logo?: string;
  couleurPrimaire?: string;
  couleurSecondaire?: string;
  couleurDashboard?: string;
  description?: string;
  devise: string;
  timezone: string;
  periodePayroll: string;
  estActive: boolean;
  parametres?: Record<string, unknown>;
  creeLe: string;
  modifieLe: string;
}

interface CompanyContextType {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchCompany = async () => {
    // Prevent multiple simultaneous calls
    if (isLoading || hasFetched) {
      return;
    }

    if (!isAuthenticated || !user) {
      setCompany(null);
      setIsLoading(false);
      setHasFetched(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setCompany(null);
        setIsLoading(false);
        setHasFetched(true);
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/me/company', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, clear company data
          setCompany(null);
          setIsLoading(false);
          setHasFetched(true);
          return;
        }
        if (response.status === 404) {
          // User doesn't have an employee record (admin/superadmin), no company
          // This is normal behavior, not an error - don't log anything
          setCompany(null);
          setIsLoading(false);
          setHasFetched(true);
          return;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const companyData = await response.json();
      setCompany(companyData);

      // Apply company colors to CSS variables
      if (companyData.couleurPrimaire) {
        document.documentElement.style.setProperty('--color-primary', companyData.couleurPrimaire);
      }
      if (companyData.couleurSecondaire) {
        document.documentElement.style.setProperty('--color-secondary', companyData.couleurSecondaire);
      }
      if (companyData.couleurDashboard) {
        document.documentElement.style.setProperty('--color-dashboard', companyData.couleurDashboard);
      }

    } catch (err) {
      // Only log real errors, not expected 404s for admins without employee records
      if (!(err instanceof Error) || !err.message.includes('404')) {
        console.error('Erreur lors du chargement de l\'entreprise:', err);
      }
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'entreprise');
      setCompany(null);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  const refreshCompany = async () => {
    await fetchCompany();
  };

  useEffect(() => {
    fetchCompany();
  }, [user, isAuthenticated]);

  const value: CompanyContextType = {
    company,
    isLoading,
    error,
    refreshCompany,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};