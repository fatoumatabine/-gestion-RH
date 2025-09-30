import request from 'supertest';
import { app } from '../../src/app';
import { globalPrisma } from '../../src/database/global.prisma.client';
import bcrypt from 'bcrypt';

const prisma = globalPrisma;

describe('Security Tests', () => {
  let userToken;
  let refreshToken;

  beforeAll(async () => {
    // Créer un utilisateur de test
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    await prisma.user.create({
      data: {
        email: 'test.security@test.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'Security',
        role: 'CASHIER'
      }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: 'test.security@test.com' }
    });
    await prisma.$disconnect();
  });

  describe('Rate Limiting', () => {
    it('should block after 5 failed attempts', async () => {
      const attempts = [];
      // Faire 6 tentatives de connexion avec un mauvais mot de passe
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(app)
            .post('/auth/login')
            .send({
              email: 'test.security@test.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(attempts);
      
      // Les 5 premières tentatives devraient être des échecs d'authentification (401)
      expect(responses[0].status).toBe(401);
      expect(responses[4].status).toBe(401);
      
      // La 6ème tentative devrait être bloquée par le rate limiter (429)
      expect(responses[5].status).toBe(429);
    });
  });

  describe('Password Security', () => {
    it('should reject weak passwords during registration', async () => {
      const weakPasswords = [
        'short', // Trop court
        'onlylowercase', // Pas de majuscule
        'ONLYUPPERCASE', // Pas de minuscule
        'NoSpecialChar1', // Pas de caractère spécial
        'No@Numbers', // Pas de chiffre
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'new.user@test.com',
            password: password,
            firstName: 'New',
            lastName: 'User',
            role: 'CASHIER'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
      }
    });

    it('should accept strong password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'strong.password@test.com',
          password: 'StrongP@ss123',
          firstName: 'Strong',
          lastName: 'Password',
          role: 'CASHIER'
        });

      expect(response.status).toBe(201);
    });
  });

  describe('JWT and Session Security', () => {
    it('should receive both access and refresh tokens on login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test.security@test.com',
          password: 'Test@123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token'); // Access token
      expect(response.headers['set-cookie']).toBeDefined(); // Refresh token in cookie
      
      userToken = response.body.token;
      refreshToken = response.headers['set-cookie'][0];
    });

    it('should reject requests without valid token', async () => {
      const response = await request(app)
        .get('/api/protected-route')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
    });

    it('should accept requests with valid token', async () => {
      const response = await request(app)
        .get('/api/protected-route')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });

    it('should refresh token successfully', async () => {
      // Attendre que le token expire (simulé)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', refreshToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('CORS and Headers Security', () => {
    it('should have secure headers', async () => {
      const response = await request(app)
        .get('/');

      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
    });

    it('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://evil-site.com');

      expect(response.headers).not.toHaveProperty('access-control-allow-origin', 'http://evil-site.com');
    });
  });

  describe('Role-Based Security', () => {
    it('should restrict access based on user role', async () => {
      // Test accès route admin avec utilisateur CASHIER
      const responseCashier = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(responseCashier.status).toBe(403);

      // Créer un admin et tester l'accès
      const adminResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Admin@123'
        });

      const adminToken = adminResponse.body.token;

      const responseAdmin = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(responseAdmin.status).toBe(200);
    });
  });
});