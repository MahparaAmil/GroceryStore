const request = require('supertest');
const app = require('../src/app');

// Mock the services
jest.mock('../src/services/supabaseService', () => ({
    productOps: {
        getAll: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    userOps: {},
    brandOps: {},
    orderOps: {},
    invoiceOps: {},
}));

const { productOps } = require('../src/services/supabaseService');

// Mock auth/admin middlewares
jest.mock('../src/middlewares/authMiddleware', () => (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
});

jest.mock('../src/middlewares/adminOnly', () => (req, res, next) => {
    next();
});

describe('Product API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /products', () => {
        it('should return a list of products', async () => {
            const mockResult = {
                data: [{ id: 1, name: 'Apple' }],
                count: 1
            };

            productOps.getAll.mockResolvedValue(mockResult);

            const res = await request(app).get('/products');

            expect(res.statusCode).toEqual(200);
            expect(res.body.data[0].name).toEqual('Apple');
        });
    });

    describe('POST /products', () => {
        it('should create a product', async () => {
            const newProduct = { name: 'Banana', price: 1.2, category: 'Fruit', quantityInStock: 10 };
            productOps.create.mockResolvedValue({ id: 2, ...newProduct });

            const res = await request(app)
                .post('/products')
                .send(newProduct);

            expect(res.statusCode).toEqual(201);
            expect(res.body.product.name).toEqual('Banana');
            expect(productOps.create).toHaveBeenCalled();
        });
    });

    describe('DELETE /products/:id', () => {
        it('should delete a product', async () => {
            productOps.getById.mockResolvedValue({ id: 1 });
            productOps.delete.mockResolvedValue(true);

            const res = await request(app).delete('/products/1');

            expect(res.statusCode).toEqual(200);
            expect(productOps.delete).toHaveBeenCalledWith('1');
        });

        it('should return 404 if product not found', async () => {
            productOps.getById.mockResolvedValue(null);

            const res = await request(app).delete('/products/999');

            expect(res.statusCode).toEqual(404);
        });
    });
});
