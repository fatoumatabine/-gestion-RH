import { AuthService } from '../../src/auth/auth.service';
import { globalPrisma } from '../../src/database/global.prisma.client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = globalPrisma;

// Mock Prisma
jest.mock('../../src/database/global.prisma.client', () => ({
  globalPrisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    entreprise: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return null for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await AuthService.validateUser('test@test.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null for invalid password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        passwordHash: await bcrypt.hash('realpassword', 10),
        role: 'CASHIER',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await AuthService.validateUser('test@test.com', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return user data for SUPERADMIN', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'SUPERADMIN',
        firstName: 'Super',
        lastName: 'Admin',
      };

      const mockEnterprises = [
        { id: 1, nom: 'Enterprise 1', estActive: true },
        { id: 2, nom: 'Enterprise 2', estActive: true },
      ];

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.entreprise.findMany.mockResolvedValue(mockEnterprises);

      const result = await AuthService.validateUser('admin@test.com', 'password123');
      
      expect(result).toHaveProperty('entreprises');
      expect(result.entreprises).toEqual(mockEnterprises);
      expect(result.role).toBe('SUPERADMIN');
    });

    it('should return user data for CASHIER', async () => {
      const mockUser = {
        id: 1,
        email: 'cashier@test.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'CASHIER',
        firstName: 'Test',
        lastName: 'Cashier',
        employee: {
          employeeId: 'EMP001',
          department: 'Sales',
          position: 'Cashier',
          entrepriseId: 1
        }
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await AuthService.validateUser('cashier@test.com', 'password123');
      
      expect(result).toHaveProperty('employeeId');
      expect(result.role).toBe('CASHIER');
      expect(result.department).toBe('Sales');
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'new@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'CASHIER',
      };

      const mockCreatedUser = {
        id: 1,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      prisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await AuthService.createUser(userData);
      expect(result).toEqual(mockCreatedUser);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        role: 'CASHIER',
      };

      const token = AuthService.generateToken(user);
      expect(token).toBeTruthy();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key');
      expect(decoded).toHaveProperty('id', user.id);
      expect(decoded).toHaveProperty('email', user.email);
      expect(decoded).toHaveProperty('role', user.role);
    });
  });
});