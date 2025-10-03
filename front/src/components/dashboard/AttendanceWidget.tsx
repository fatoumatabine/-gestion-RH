import React, { useState, useEffect } from 'react';
import { FaClock, FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import { attendanceService, AttendanceRecord } from '../../services/attendance';

const AttendanceWidget: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load today's attendance on component mount
  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getTodayAttendance();
      if (response.success) {
        setTodayAttendance(response.data.attendance);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du pointage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);

      // Get current location if available
      let locationData = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });

          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            ipAddress: '', // Will be set by backend
            deviceInfo: navigator.userAgent
          };
        } catch (locationError) {
          console.warn('Impossible d\'obtenir la localisation:', locationError);
          locationData = {
            ipAddress: '',
            deviceInfo: navigator.userAgent
          };
        }
      }

      const response = await attendanceService.checkIn(locationData);

      if (response.success) {
        showSuccess('Pointage réussi', `Arrivée enregistrée à ${new Date(response.data.checkInTime).toLocaleTimeString('fr-FR')}`);
        setTodayAttendance(response.data.attendance);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Impossible d\'enregistrer le pointage d\'arrivée';
      showError('Erreur de pointage', errorMessage);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);

      let locationData = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });

          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            ipAddress: '',
            deviceInfo: navigator.userAgent
          };
        } catch (locationError) {
          console.warn('Impossible d\'obtenir la localisation:', locationError);
          locationData = {
            ipAddress: '',
            deviceInfo: navigator.userAgent
          };
        }
      }

      const response = await attendanceService.checkOut(locationData);

      if (response.success) {
        showSuccess('Pointage réussi', `Départ enregistré à ${new Date(response.data.checkOutTime).toLocaleTimeString('fr-FR')}`);
        setTodayAttendance(response.data.attendance);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Impossible d\'enregistrer le pointage de départ';
      showError('Erreur de pointage', errorMessage);
    } finally {
      setCheckingOut(false);
    }
  };

  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return '--:--';
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PRESENT: 'text-green-600 bg-green-100',
      RETARD: 'text-yellow-600 bg-yellow-100',
      DEPART_ANTICIPE: 'text-orange-600 bg-orange-100',
      ABSENT: 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PRESENT: 'Présent',
      RETARD: 'Retard',
      DEPART_ANTICIPE: 'Départ anticipé',
      ABSENT: 'Absent'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const hasCheckedIn = todayAttendance?.heureArrivee;
  const hasCheckedOut = todayAttendance?.heureDepart;
  const isWorkingDay = true; // TODO: Check against company rules

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaClock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pointage du jour</h3>
            <p className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {currentTime.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="text-xs text-gray-500">Heure locale</div>
        </div>
      </div>

      {/* Status Badge */}
      {todayAttendance && (
        <div className="mb-4">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(todayAttendance.statut)}`}>
            {getStatusLabel(todayAttendance.statut)}
          </span>
        </div>
      )}

      {/* Time Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <FaSignInAlt className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Arrivée</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatTime(todayAttendance?.heureArrivee)}
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <FaSignOutAlt className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Départ</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatTime(todayAttendance?.heureDepart)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!hasCheckedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={checkingIn || !isWorkingDay}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {checkingIn ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Pointage en cours...
              </>
            ) : (
              <>
                <FaSignInAlt className="mr-2" />
                Pointer mon arrivée
              </>
            )}
          </button>
        ) : !hasCheckedOut ? (
          <button
            onClick={handleCheckOut}
            disabled={checkingOut}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {checkingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Pointage en cours...
              </>
            ) : (
              <>
                <FaSignOutAlt className="mr-2" />
                Pointer mon départ
              </>
            )}
          </button>
        ) : (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FaCalendarAlt className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">
              Journée terminée
            </p>
            <p className="text-xs text-green-600 mt-1">
              Pointage complété pour aujourd'hui
            </p>
          </div>
        )}

        {/* Location Info */}
        {todayAttendance?.latitude && todayAttendance?.longitude && (
          <div className="flex items-center justify-center text-xs text-gray-500 mt-2">
            <FaMapMarkerAlt className="mr-1" />
            Localisation enregistrée
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {todayAttendance ? '1' : '0'}
            </div>
            <div className="text-xs text-gray-500">Jour travaillé</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {hasCheckedIn && hasCheckedOut ? '8' : hasCheckedIn ? '~4' : '0'}
            </div>
            <div className="text-xs text-gray-500">Heures</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {todayAttendance?.statut === 'PRESENT' ? '✓' : todayAttendance?.statut === 'RETARD' ? '⚠' : '-'}
            </div>
            <div className="text-xs text-gray-500">Statut</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceWidget;