import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import RoleBasedDashboard from "./components/dashboard/RoleBasedDashboard";
import CashierDashboard from "./components/dashboard/CashierDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// HR Pages
import EmployeeList from "./pages/Employees/EmployeeList";
import AddEmployee from "./pages/Employees/AddEmployee";
import CompanyList from "./pages/Companies/CompanyList";
import AddCompany from "./pages/Companies/AddCompany";
import CompanyDetail from "./pages/Companies/CompanyDetail";
import CompanyEdit from "./pages/Companies/CompanyEdit";
import CompanyDashboard from "./pages/Companies/CompanyDashboard";
import PayrollList from "./pages/Payrolls/PayrollList";
import GeneratePayroll from "./pages/Payrolls/GeneratePayroll";
import LeaveRequests from "./pages/Leaves/LeaveRequests";
import SalaryHistory from "./pages/SalaryHistory";
import CalendarPage from "./pages/CalendarPage";
import InvoiceList from "./pages/Invoices/InvoiceList";
import UserManagement from "./pages/Admin/UserManagement";

// Reports & Analytics
import HRReports from "./pages/Reports/HRReports";
import Statistics from "./pages/Reports/Statistics";
import DashboardAnalytics from "./pages/Analytics/DashboardAnalytics";
import DetailedReports from "./pages/Analytics/DetailedReports";

// Settings
import PayrollSettings from "./pages/Settings/PayrollSettings";
import TemplateSettings from "./pages/Settings/TemplateSettings";
import Preferences from "./pages/Settings/Preferences";

// Profile
import ChangePassword from "./pages/Profile/ChangePassword";

const router = createBrowserRouter(
  [
    {
      path: "/auth/sign-in",
      element: <SignIn />
    },
    {
      path: "/auth/sign-up",
      element: <SignUp />
    },
    {
      path: "/404",
      element: <NotFound />
    },
    {
      element: <AppLayout />,
      children: [
        {
          path: "/payments",
          element: (
            <ProtectedRoute allowedRoles={["CASHIER", "ADMIN", "SUPERADMIN"]}>
              <CashierDashboard />
            </ProtectedRoute>
          )
        },
        {
          path: "/",
          element: (
            <ProtectedRoute allowedRoles={["CASHIER", "ADMIN", "SUPERADMIN"]}>
              <RoleBasedDashboard />
            </ProtectedRoute>
          )
        },
        {
          path: "/companies",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <CompanyList />
            </ProtectedRoute>
          )
        },
        {
          path: "/companies/new",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <AddCompany />
            </ProtectedRoute>
          )
        },
        {
          path: "/companies/:id",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <CompanyDetail />
            </ProtectedRoute>
          )
        },
        {
          path: "/companies/:id/edit",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <CompanyEdit />
            </ProtectedRoute>
          )
        },
        {
          path: "/companies/:id/dashboard",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <CompanyDashboard />
            </ProtectedRoute>
          )
        },
        {
          path: "/employees",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <EmployeeList />
            </ProtectedRoute>
          )
        },
        {
          path: "/employees/new",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <AddEmployee />
            </ProtectedRoute>
          )
        },
        {
          path: "/payrolls",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <PayrollList />
            </ProtectedRoute>
          )
        },
        {
          path: "/payrolls/new",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <GeneratePayroll />
            </ProtectedRoute>
          )
        },
        {
          path: "/leaves",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <LeaveRequests />
            </ProtectedRoute>
          )
        },
        {
          path: "/salary-history",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <SalaryHistory />
            </ProtectedRoute>
          )
        },
        {
          path: "/calendar",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <CalendarPage />
            </ProtectedRoute>
          )
        },
        {
          path: "/invoices",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <InvoiceList />
            </ProtectedRoute>
          )
        },
        {
          path: "/users",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <UserManagement />
            </ProtectedRoute>
          )
        },
        {
          path: "/reports/hr",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <HRReports />
            </ProtectedRoute>
          )
        },
        {
          path: "/reports/statistics",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <Statistics />
            </ProtectedRoute>
          )
        },
        {
          path: "/analytics/dashboard",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <DashboardAnalytics />
            </ProtectedRoute>
          )
        },
        {
          path: "/analytics/reports",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <DetailedReports />
            </ProtectedRoute>
          )
        },
        {
          path: "/settings/payroll",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <PayrollSettings />
            </ProtectedRoute>
          )
        },
        {
          path: "/settings/templates",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <TemplateSettings />
            </ProtectedRoute>
          )
        },
        {
          path: "/settings/preferences",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
              <Preferences />
            </ProtectedRoute>
          )
        },
        {
          path: "/profile",
          element: (
            <ProtectedRoute>
              <UserProfiles />
            </ProtectedRoute>
          )
        },
        {
          path: "/profile/change-password",
          element: (
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          )
        },
        {
          path: "/videos",
          element: (
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          )
        },
        {
          path: "/images",
          element: (
            <ProtectedRoute>
              <Images />
            </ProtectedRoute>
          )
        },
        {
          path: "/alerts",
          element: (
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          )
        },
        {
          path: "/badges",
          element: (
            <ProtectedRoute>
              <Badges />
            </ProtectedRoute>
          )
        },
        {
          path: "/avatars",
          element: (
            <ProtectedRoute>
              <Avatars />
            </ProtectedRoute>
          )
        },
        {
          path: "/buttons",
          element: (
            <ProtectedRoute>
              <Buttons />
            </ProtectedRoute>
          )
        },
        {
          path: "/charts/line",
          element: (
            <ProtectedRoute>
              <LineChart />
            </ProtectedRoute>
          )
        },
        {
          path: "/charts/bar",
          element: (
            <ProtectedRoute>
              <BarChart />
            </ProtectedRoute>
          )
        },
        {
          path: "/tables/basic",
          element: (
            <ProtectedRoute>
              <BasicTables />
            </ProtectedRoute>
          )
        },
        {
          path: "/forms/form-elements",
          element: (
            <ProtectedRoute>
              <FormElements />
            </ProtectedRoute>
          )
        },
        {
          path: "/blank",
          element: (
            <ProtectedRoute>
              <Blank />
            </ProtectedRoute>
          )
        }
      ]
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />
    }
  ]
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;