const request = require('supertest');
const app = require('../src/app');

// Mock the services to avoid real database calls
jest.mock('../src/services/supabaseService', () => ({
    userOps: {
        findAll: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    // Add other ops if needed by middlewares
    brandOps: {},
    productOps: {},
    orderOps: {},
    invoiceOps: {},
}));

const { userOps } = require('../src/services/supabaseService');
// const { verifyToken, isAdmin } = require('../src/utils/tokenUtils');

// Mock auth middleware
jest.mock('../src/middlewares/authMiddleware', () => (req, res, next) => {
    req.user = { id: 1, role: 'admin', email: 'admin@test.com' };
    next();
});

jest.mock('../src/middlewares/adminOnly', () => (req, res, next) => {
    next(); // Allow everything
});

describe('User API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /users', () => {
        it('should return all users without passwords', async () => {
            const mockUsers = [
                { id: 1, email: 'admin@test.com', password: 'hashed', role: 'admin' },
                { id: 2, email: 'user@test.com', password: 'hashed', role: 'customer' },
            ];

            userOps.findAll.mockResolvedValue(mockUsers);

            const res = await request(app).get('/users');

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(2);
            expect(res.body[0]).not.toHaveProperty('password');
            expect(userOps.findAll).toHaveBeenCalledTimes(1);
        });

        it('should handle errors gracefully', async () => {
            userOps.findAll.mockRejectedValue(new Error('DB Error'));
            const res = await request(app).get('/users');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            const newUser = {
                email: 'new@test.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe'
            };

            userOps.findByEmail.mockResolvedValue(null);
            userOps.create.mockResolvedValue({ ...newUser, id: 3, role: 'customer' });

            const res = await request(app)
                .post('/users')
                .send(newUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body.user).toHaveProperty('email', 'new@test.com');
            expect(res.body.user).not.toHaveProperty('password');
            expect(userOps.create).toHaveBeenCalledWith(expect.objectContaining({
                email: 'new@test.com',
                firstName: 'John'
            }));
        });

        it('should fail if email exists', async () => {
            userOps.findByEmail.mockResolvedValue({ id: 1 });

            const res = await request(app)
                .post('/users')
                .send({ email: 'taken@test.com', password: '123' });

            expect(res.statusCode).toEqual(409);
        });
    });
});
