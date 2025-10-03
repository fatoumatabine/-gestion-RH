import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/button/Button';
import { FaQrcode, FaUsers, FaClock, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, FaPlus } from 'react-icons/fa';

interface Employee {
  id: number;
  employeeId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  department: string;
  position: string;
  qrCode: string;
  status: string;
}

interface AttendanceRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  location: string;
  qrCode: string;
}

const AttendanceDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0
  });

  // Vérifier les permissions
  useEffect(() => {
    if (user && !['CASHIER', 'ADMIN', 'SUPERADMIN'].includes(user.role)) {
      showError('Accès refusé', 'Seuls les caissiers et administrateurs peuvent accéder à cette page');
      navigate('/dashboard');
    }
  }, [user, navigate, showError]);

  // Charger les données de pointage
  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);

      // Charger les employés depuis l'API
      const employeesResponse = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      let employeesData: Employee[] = [];
      if (employeesResponse.ok) {
        const responseData = await employeesResponse.json();
        console.log('🔍 Réponse API employés:', responseData);

        // Handle different response formats
        if (Array.isArray(responseData)) {
          employeesData = responseData as Employee[];
        } else if (responseData && Array.isArray(responseData.data)) {
          employeesData = responseData.data as Employee[];
        } else if (responseData && Array.isArray(responseData.employees)) {
          employeesData = responseData.employees as Employee[];
        } else {
          console.warn('⚠️ Format de réponse API inattendu:', responseData);
          employeesData = [];
        }

        console.log('🔍 Employés chargés:', (employeesData || []).map(emp => ({
          id: emp.id,
          employeeId: emp.employeeId,
          name: `${emp.user?.firstName || 'N/A'} ${emp.user?.lastName || 'N/A'}`,
          qrCodeLength: emp.qrCode ? emp.qrCode.length : 0,
          qrCodePreview: emp.qrCode ? emp.qrCode.substring(0, 50) + '...' : 'null'
        })));

        // Ensure we always have an array
        if (!Array.isArray(employeesData)) {
          console.error('Employees data is not an array:', employeesData);
          employeesData = [];
        }

        setEmployees(employeesData);
      } else {
        console.error('❌ Erreur chargement employés:', employeesResponse.status, employeesResponse.statusText);
        employeesData = [];
      }

      // Simulation des données de pointage pour le mois en cours
      const mockData: AttendanceRecord[] = (employeesData || []).map((employee, index) => ({
        id: index + 1,
        employeeId: employee.employeeId,
        employeeName: `${employee.user.firstName} ${employee.user.lastName}`,
        department: employee.department || 'N/A',
        date: new Date().toISOString().split('T')[0],
        checkInTime: index % 3 === 0 ? '08:30' : index % 3 === 1 ? '09:15' : '',
        checkOutTime: index % 3 === 0 ? '17:45' : index % 3 === 1 ? null : null,
        status: index % 3 === 0 ? 'PRESENT' : index % 3 === 1 ? 'LATE' : 'ABSENT',
        location: index % 3 !== 2 ? 'Bureau principal' : '',
        qrCode: employee.qrCode || ''
      }));

      setAttendanceRecords(mockData);

      // Statistiques
      setStats({
        totalEmployees: employeesData.length,
        presentToday: mockData.filter(r => r.status === 'PRESENT').length,
        lateToday: mockData.filter(r => r.status === 'LATE').length,
        absentToday: mockData.filter(r => r.status === 'ABSENT').length
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Erreur', 'Impossible de charger les données de pointage');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <FaCheckCircle className="h-4 w-4" />;
      case 'LATE':
        return <FaClock className="h-4 w-4" />;
      case 'ABSENT':
        return <FaTimesCircle className="h-4 w-4" />;
      default:
        return <FaClock className="h-4 w-4" />;
    }
  };

  return (
    <>
      <PageMeta
        title="Pointages | Gestion RH"
        description="Tableau de bord des pointages et présence des employés"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Gestion des Pointages
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Suivez la présence et les horaires de vos employés
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => navigate('/attendance/scan')}
              className="flex items-center space-x-2"
            >
              <FaQrcode />
              <span>Scanner QR</span>
            </Button>
            <Button
              onClick={() => navigate('/employees/new')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FaPlus />
              <span>Ajouter Employé</span>
            </Button>
          </div>
        </div>

        {/* Sélecteur de mois */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <FaCalendarAlt className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sélectionner un mois :
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Employés
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalEmployees}
                </p>
              </div>
              <FaUsers className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Présents Aujourd'hui
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.presentToday}
                </p>
              </div>
              <FaCheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  En Retard
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.lateToday}
                </p>
              </div>
              <FaClock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Absents
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.absentToday}
                </p>
              </div>
              <FaTimesCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Tableau des pointages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pointages du mois de {new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Chargement des pointages...
                </span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Départment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Arrivée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Départ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      QR Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {record.employeeName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.employeeId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.checkInTime || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.checkOutTime || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          <span className="ml-1 capitalize">
                            {record.status === 'PRESENT' ? 'Présent' :
                             record.status === 'LATE' ? 'En retard' : 'Absent'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          console.log(`🎯 Affichage QR pour ${record.employeeId}:`, {
                            hasQrCode: !!record.qrCode,
                            qrCodePath: record.qrCode,
                            isRelativePath: record.qrCode?.startsWith('/uploads/') || false
                          });

                          if (record.qrCode && record.qrCode.startsWith('/uploads/')) {
                            // Nouveau format : chemin de fichier
                            const fullUrl = `http://localhost:5000${record.qrCode}`;
                            return (
                              <div className="flex items-center space-x-2">
                                <img
                                  src={fullUrl}
                                  alt={`QR Code ${record.employeeId}`}
                                  className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
                                  onError={(e) => {
                                    console.error('❌ Erreur chargement QR code pour', record.employeeId, ':', fullUrl);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  onLoad={() => {
                                    console.log('✅ QR code chargé avec succès pour', record.employeeId, 'via', fullUrl);
                                  }}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {record.employeeId}
                                </span>
                              </div>
                            );
                          } else if (record.qrCode && record.qrCode.startsWith('data:image')) {
                            // Ancien format : data URL (pour compatibilité)
                            return (
                              <div className="flex items-center space-x-2">
                                <img
                                  src={record.qrCode}
                                  alt={`QR Code ${record.employeeId}`}
                                  className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
                                  onError={(e) => {
                                    console.error('❌ Erreur chargement QR data URL pour', record.employeeId);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  onLoad={() => {
                                    console.log('✅ QR data URL chargé pour', record.employeeId);
                                  }}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {record.employeeId}
                                </span>
                              </div>
                            );
                          } else if (record.qrCode) {
                            console.warn('⚠️ QR code présent mais format invalide pour', record.employeeId, ':', record.qrCode);
                            return (
                              <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                    QR
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {record.employeeId}
                                </span>
                              </div>
                            );
                          } else {
                            console.warn('⚠️ Aucun QR code pour', record.employeeId);
                            return (
                              <span className="text-xs text-red-500 dark:text-red-400">
                                QR non généré
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/attendance/${record.id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {attendanceRecords.length === 0 && !loading && (
              <div className="text-center py-12">
                <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun pointage trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun employé n'a pointé pour cette date.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Comment utiliser le système de pointage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">Pour les employés :</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Chaque employé reçoit un QR code unique</li>
                <li>Le QR code est généré automatiquement</li>
                <li>Scanner le QR code pour pointer</li>
                <li>Pointage arrivée et départ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Pour les caissiers :</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Utiliser le scanner QR intégré</li>
                <li>Vérifier l'identité de l'employé</li>
                <li>Valider le pointage</li>
                <li>Consulter l'historique</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceDashboard;