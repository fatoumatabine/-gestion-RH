import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper function to get employee from user
const getEmployeeFromUser = async (userId) => {
  return await prisma.employee.findUnique({
    where: { userId: parseInt(userId) },
    include: {
      entreprise: true
    }
  });
};

// Helper function to calculate attendance status
const calculateAttendanceStatus = (checkInTime, checkOutTime, rules) => {
  if (!checkInTime) return 'ABSENT';

  const [startHour, startMinute] = rules.heureDebut.split(':').map(Number);
  const [endHour, endMinute] = rules.heureFin.split(':').map(Number);

  const startTime = new Date(checkInTime);
  startTime.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(checkOutTime || checkInTime);
  endTime.setHours(endHour, endMinute, 0, 0);

  const toleranceMs = rules.toleranceRetard * 60 * 1000; // Convert minutes to ms
  const toleranceDepartMs = rules.toleranceDepart * 60 * 1000;

  // Check if late
  if (checkInTime > new Date(startTime.getTime() + toleranceMs)) {
    return 'RETARD';
  }

  // Check if early departure
  if (checkOutTime && checkOutTime < new Date(endTime.getTime() - toleranceDepartMs)) {
    return 'DEPART_ANTICIPE';
  }

  return 'PRESENT';
};

// Check-in endpoint
const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, ipAddress, deviceInfo } = req.body;

    const employee = await getEmployeeFromUser(userId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.pointage.findFirst({
      where: {
        employeId: employee.id,
        date: today
      }
    });

    if (existingAttendance && existingAttendance.heureArrivee) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà pointé votre arrivée aujourd\'hui'
      });
    }

    // Get company rules
    const rules = await prisma.reglePointage.findUnique({
      where: { entrepriseId: employee.entrepriseId }
    });

    if (!rules) {
      return res.status(400).json({
        success: false,
        message: 'Règles de pointage non configurées pour cette entreprise'
      });
    }

    // Check if today is a working day
    const todayName = new Date().toLocaleLowerCase('fr', { weekday: 'long' });
    const workingDays = rules.joursTravail || [];
    if (!workingDays.includes(todayName.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Aujourd\'hui n\'est pas un jour de travail'
      });
    }

    const checkInTime = new Date();

    // Create or update attendance record
    const attendance = await prisma.pointage.upsert({
      where: {
        employeId_date: {
          employeId: employee.id,
          date: today
        }
      },
      update: {
        heureArrivee: checkInTime,
        latitude,
        longitude,
        ipAddress,
        deviceInfo
      },
      create: {
        employeId: employee.id,
        date: today,
        heureArrivee: checkInTime,
        latitude,
        longitude,
        ipAddress,
        deviceInfo
      }
    });

    res.json({
      success: true,
      message: 'Pointage d\'arrivée enregistré avec succès',
      data: {
        attendance,
        checkInTime: checkInTime.toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors du pointage arrivée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du pointage d\'arrivée'
    });
  }
};

// Check-out endpoint
const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, ipAddress, deviceInfo } = req.body;

    const employee = await getEmployeeFromUser(userId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.pointage.findFirst({
      where: {
        employeId: employee.id,
        date: today
      }
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez d\'abord pointer votre arrivée'
      });
    }

    if (attendance.heureDepart) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà pointé votre départ aujourd\'hui'
      });
    }

    const checkOutTime = new Date();

    // Get company rules
    const rules = await prisma.reglePointage.findUnique({
      where: { entrepriseId: employee.entrepriseId }
    });

    // Calculate status
    const status = calculateAttendanceStatus(attendance.heureArrivee, checkOutTime, rules);

    // Update attendance record
    const updatedAttendance = await prisma.pointage.update({
      where: { id: attendance.id },
      data: {
        heureDepart: checkOutTime,
        statut: status,
        latitude: latitude || attendance.latitude,
        longitude: longitude || attendance.longitude,
        ipAddress: ipAddress || attendance.ipAddress,
        deviceInfo: deviceInfo || attendance.deviceInfo
      }
    });

    res.json({
      success: true,
      message: 'Pointage de départ enregistré avec succès',
      data: {
        attendance: updatedAttendance,
        checkOutTime: checkOutTime.toISOString(),
        status
      }
    });

  } catch (error) {
    console.error('Erreur lors du pointage départ:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du pointage de départ'
    });
  }
};

// Get attendance history for current user
const getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    const employee = await getEmployeeFromUser(userId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    const where = {
      employeId: employee.id
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [attendances, total] = await Promise.all([
      prisma.pointage.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.pointage.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        attendances,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// Get today's attendance for current user
const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await getEmployeeFromUser(userId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.pointage.findFirst({
      where: {
        employeId: employee.id,
        date: today
      }
    });

    res.json({
      success: true,
      data: { attendance }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du pointage du jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du pointage du jour'
    });
  }
};

// Admin dashboard - get all attendances for the day
const getAdminDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { date, department } = req.query;

    let entrepriseId;

    // Essayer de récupérer l'employé de l'utilisateur
    const employee = await getEmployeeFromUser(userId);

    if (employee) {
      // L'utilisateur a un employé associé, utiliser son entreprise
      entrepriseId = employee.entrepriseId;
    } else if (userRole === 'SUPERADMIN') {
      // SUPERADMIN sans employé - pour l'instant, prendre la première entreprise
      // TODO: Permettre de spécifier l'entreprise via un paramètre
      const firstCompany = await prisma.entreprise.findFirst();
      if (!firstCompany) {
        return res.status(404).json({
          success: false,
          message: 'Aucune entreprise trouvée dans le système'
        });
      }
      entrepriseId = firstCompany.id;
    } else {
      // ADMIN sans employé associé
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - vous devez être associé à une entreprise'
      });
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const where = {
      employe: {
        entrepriseId: entrepriseId
      },
      date: targetDate
    };

    if (department) {
      where.employe.department = department;
    }

    const attendances = await prisma.pointage.findMany({
      where,
      include: {
        employe: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { heureArrivee: 'asc' }
    });

    // Calculate statistics
    const stats = {
      totalEmployees: await prisma.employee.count({
        where: { entrepriseId: entrepriseId }
      }),
      presentToday: attendances.filter(a => a.heureArrivee).length,
      lateToday: attendances.filter(a => a.statut === 'RETARD').length,
      absentToday: attendances.filter(a => !a.heureArrivee).length
    };

    res.json({
      success: true,
      data: {
        attendances,
        stats,
        date: targetDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du dashboard admin'
    });
  }
};

// Get employee attendance details (admin)
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const attendances = await prisma.pointage.findMany({
      where: {
        employeId: parseInt(employeeId),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: { attendances }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des pointages employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pointages employé'
    });
  }
};

// Validate/modify attendance (admin)
const validateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, commentaire } = req.body;
    const validatorId = req.user.id;

    const updatedAttendance = await prisma.pointage.update({
      where: { id: parseInt(id) },
      data: {
        statut,
        commentaire,
        validePar: validatorId,
        dateValidation: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Pointage validé avec succès',
      data: { attendance: updatedAttendance }
    });

  } catch (error) {
    console.error('Erreur lors de la validation du pointage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du pointage'
    });
  }
};

// Get attendance rules
const getAttendanceRules = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let entrepriseId;

    const employee = await getEmployeeFromUser(userId);
    if (employee) {
      entrepriseId = employee.entrepriseId;
    } else if (userRole === 'SUPERADMIN') {
      const firstCompany = await prisma.entreprise.findFirst();
      if (!firstCompany) {
        return res.status(404).json({
          success: false,
          message: 'Aucune entreprise trouvée dans le système'
        });
      }
      entrepriseId = firstCompany.id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - vous devez être associé à une entreprise'
      });
    }

    const rules = await prisma.reglePointage.findUnique({
      where: { entrepriseId: entrepriseId }
    });

    res.json({
      success: true,
      data: { rules }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des règles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des règles'
    });
  }
};

// Update attendance rules (admin)
const updateAttendanceRules = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const rulesData = req.body;

    let entrepriseId;

    const employee = await getEmployeeFromUser(userId);
    if (employee) {
      entrepriseId = employee.entrepriseId;
    } else if (userRole === 'SUPERADMIN') {
      const firstCompany = await prisma.entreprise.findFirst();
      if (!firstCompany) {
        return res.status(404).json({
          success: false,
          message: 'Aucune entreprise trouvée dans le système'
        });
      }
      entrepriseId = firstCompany.id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - vous devez être associé à une entreprise'
      });
    }

    const updatedRules = await prisma.reglePointage.upsert({
      where: { entrepriseId: entrepriseId },
      update: rulesData,
      create: {
        entrepriseId: entrepriseId,
        ...rulesData
      }
    });

    res.json({
      success: true,
      message: 'Règles de pointage mises à jour avec succès',
      data: { rules: updatedRules }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des règles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des règles'
    });
  }
};

// Get absences
const getAbsences = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await getEmployeeFromUser(userId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    const absences = await prisma.absence.findMany({
      where: { employeId: employee.id },
      orderBy: { creeLe: 'desc' }
    });

    res.json({
      success: true,
      data: { absences }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des absences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des absences'
    });
  }
};

// Create absence request
const createAbsence = async (req, res) => {
  try {
    const userId = req.user.id;
    const { typeAbsence, dateDebut, dateFin, motif, pieceJointe } = req.body;

    const employee = await getEmployeeFromUser(userId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    // Calculate business days
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
    let businessDays = 0;

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        businessDays++;
      }
    }

    const absence = await prisma.absence.create({
      data: {
        employeId: employee.id,
        typeAbsence,
        dateDebut: startDate,
        dateFin: endDate,
        motif,
        pieceJointe,
        joursOuvres: businessDays,
        heuresAbsence: businessDays * 8 // Assuming 8 hours per day
      }
    });

    res.json({
      success: true,
      message: 'Demande d\'absence créée avec succès',
      data: { absence }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'absence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'absence'
    });
  }
};

// Update absence status (admin)
const updateAbsenceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, commentaireApprobation } = req.body;
    const approverId = req.user.id;

    const updatedAbsence = await prisma.absence.update({
      where: { id: parseInt(id) },
      data: {
        statut,
        approuvePar: approverId,
        dateApprobation: new Date(),
        commentaire: commentaireApprobation
      }
    });

    res.json({
      success: true,
      message: 'Statut de l\'absence mis à jour avec succès',
      data: { absence: updatedAbsence }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

// Get attendance report
const getAttendanceReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate, department } = req.query;

    let entrepriseId;

    const employee = await getEmployeeFromUser(userId);
    if (employee) {
      entrepriseId = employee.entrepriseId;
    } else if (userRole === 'SUPERADMIN') {
      const firstCompany = await prisma.entreprise.findFirst();
      if (!firstCompany) {
        return res.status(404).json({
          success: false,
          message: 'Aucune entreprise trouvée dans le système'
        });
      }
      entrepriseId = firstCompany.id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - vous devez être associé à une entreprise'
      });
    }

    const where = {
      employe: {
        entrepriseId: entrepriseId
      },
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (department) {
      where.employe.department = department;
    }

    const attendances = await prisma.pointage.findMany({
      where,
      include: {
        employe: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Calculate summary statistics
    const summary = {
      totalDays: attendances.length,
      presentDays: attendances.filter(a => a.statut === 'PRESENT').length,
      lateDays: attendances.filter(a => a.statut === 'RETARD').length,
      absentDays: attendances.filter(a => a.statut === 'ABSENT').length,
      earlyDepartureDays: attendances.filter(a => a.statut === 'DEPART_ANTICIPE').length
    };

    res.json({
      success: true,
      data: {
        summary,
        attendances
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport'
    });
  }
};

// Get detailed report
const getDetailedReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate, employeeId, department } = req.query;

    let entrepriseId;

    const employee = await getEmployeeFromUser(userId);
    if (employee) {
      entrepriseId = employee.entrepriseId;
    } else if (userRole === 'SUPERADMIN') {
      const firstCompany = await prisma.entreprise.findFirst();
      if (!firstCompany) {
        return res.status(404).json({
          success: false,
          message: 'Aucune entreprise trouvée dans le système'
        });
      }
      entrepriseId = firstCompany.id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - vous devez être associé à une entreprise'
      });
    }

    const where = {
      employe: {
        entrepriseId: entrepriseId
      },
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (employeeId) {
      where.employe.id = parseInt(employeeId);
    }

    if (department) {
      where.employe.department = department;
    }

    const attendances = await prisma.pointage.findMany({
      where,
      include: {
        employe: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        validateur: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { employe: { user: { lastName: 'asc' } } },
        { date: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: { attendances }
    });

  } catch (error) {
    console.error('Erreur lors de la génération du rapport détaillé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport détaillé'
    });
  }
};

// QR Code endpoints
const scanQRCode = async (req, res) => {
  try {
    const { qrCode, type, latitude, longitude, ipAddress, deviceInfo } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'Code QR requis'
      });
    }

    // Trouver l'employé par QR code
    const employee = await prisma.employee.findUnique({
      where: { qrCode },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        entreprise: true
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Code QR invalide ou employé non trouvé'
      });
    }

    if (employee.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Employé inactif'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Vérifier si déjà pointé aujourd'hui selon le type demandé
    const existingAttendance = await prisma.pointage.findFirst({
      where: {
        employeId: employee.id,
        date: today
      }
    });

    if (type === 'check-in' && existingAttendance?.heureArrivee) {
      return res.status(400).json({
        success: false,
        message: 'Cet employé a déjà pointé son arrivée aujourd\'hui'
      });
    }

    if (type === 'check-out' && !existingAttendance?.heureArrivee) {
      return res.status(400).json({
        success: false,
        message: 'Cet employé doit d\'abord pointer son arrivée'
      });
    }

    if (type === 'check-out' && existingAttendance?.heureDepart) {
      return res.status(400).json({
        success: false,
        message: 'Cet employé a déjà pointé son départ aujourd\'hui'
      });
    }

    // Récupérer les règles de l'entreprise
    const rules = await prisma.reglePointage.findUnique({
      where: { entrepriseId: employee.entrepriseId }
    });

    if (!rules) {
      return res.status(400).json({
        success: false,
        message: 'Règles de pointage non configurées'
      });
    }

    let attendance;
    let status = 'PRESENT';
    const now = new Date();

    if (type === 'check-in') {
      // Calculer le statut pour l'arrivée
      status = calculateAttendanceStatus(now, null, rules);

      attendance = await prisma.pointage.upsert({
        where: {
          employeId_date: {
            employeId: employee.id,
            date: today
          }
        },
        update: {
          heureArrivee: now,
          statut: status,
          latitude,
          longitude,
          ipAddress,
          deviceInfo
        },
        create: {
          employeId: employee.id,
          date: today,
          heureArrivee: now,
          statut: status,
          latitude,
          longitude,
          ipAddress,
          deviceInfo
        }
      });
    } else if (type === 'check-out') {
      // Calculer le statut final pour le départ
      status = calculateAttendanceStatus(existingAttendance.heureArrivee, now, rules);

      attendance = await prisma.pointage.update({
        where: { id: existingAttendance.id },
        data: {
          heureDepart: now,
          statut: status,
          latitude: latitude || existingAttendance.latitude,
          longitude: longitude || existingAttendance.longitude,
          ipAddress: ipAddress || existingAttendance.ipAddress,
          deviceInfo: deviceInfo || existingAttendance.deviceInfo
        }
      });
    }

    res.json({
      success: true,
      message: `Pointage ${type === 'check-in' ? 'd\'arrivée' : 'de départ'} enregistré pour ${employee.user.firstName} ${employee.user.lastName}`,
      data: {
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          firstName: employee.user.firstName,
          lastName: employee.user.lastName,
          department: employee.department
        },
        attendance,
        timestamp: now.toISOString(),
        status
      }
    });

  } catch (error) {
    console.error('Erreur lors du scan QR:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du scan du QR code'
    });
  }
};

// Get employee QR code (for employees to view their own QR)
const getEmployeeQRCode = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await prisma.employee.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    if (!employee.qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code non généré pour cet employé'
      });
    }

    res.json({
      success: true,
      data: {
        qrCode: employee.qrCode,
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          firstName: employee.user.firstName,
          lastName: employee.user.lastName
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du QR code'
    });
  }
};

// Regenerate QR code for an employee (admin only)
const regenerateEmployeeQRCode = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeeId) },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    // Générer un nouveau QR code
    const crypto = await import('crypto');
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const qrData = `${employee.employeeId}-${randomBytes}`;
    const newQrCode = crypto.createHash('sha256').update(qrData).digest('hex').substring(0, 32);

    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: { qrCode: newQrCode }
    });

    res.json({
      success: true,
      message: 'QR code régénéré avec succès',
      data: {
        employee: {
          id: updatedEmployee.id,
          employeeId: updatedEmployee.employeeId,
          firstName: employee.user.firstName,
          lastName: employee.user.lastName
        },
        qrCode: newQrCode
      }
    });

  } catch (error) {
    console.error('Erreur lors de la régénération du QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la régénération du QR code'
    });
  }
};

export default {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTodayAttendance,
  getAdminDashboard,
  getEmployeeAttendance,
  validateAttendance,
  getAttendanceRules,
  updateAttendanceRules,
  getAbsences,
  createAbsence,
  updateAbsenceStatus,
  getAttendanceReport,
  getDetailedReport,
  scanQRCode,
  getEmployeeQRCode,
  regenerateEmployeeQRCode
};