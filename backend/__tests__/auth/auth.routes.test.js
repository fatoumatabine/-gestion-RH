import request from 'supertest';
import { app } from '../../src/app';
import { globalPrisma } from '../../src/database/global.prisma.client';
import bcrypt from 'bcrypt';

const prisma = globalPrisma;

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Créer un utilisateur de test
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: 'test@test.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'CASHIER',
      },
    });
  });

  afterAll(async () => {
    // Nettoyer la base de données après les tests
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('role', 'CASHIER');
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalidemail',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'new@test.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          role: 'CASHIER',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'new@test.com');
    });

    it('should fail with existing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@test.com', // Email déjà utilisé
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'CASHIER',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Cet email est déjà utilisé');
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid',
          password: '123', // Trop court
          firstName: '', // Vide
          lastName: 'User',
          role: 'INVALID_ROLE', // Rôle invalide
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});