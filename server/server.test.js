const request = require('supertest');
const { app, startServer } = require('./server');
const { getUsers, getUserProfiles } = require('./services/dataService');

jest.mock('./services/dataService');

let server;
const PORT = 0; // Используем 0 для назначения динамического порта

describe('POST /api/submit', () => {
    beforeAll(() => {
        server = startServer(PORT);
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(() => {
        getUsers.mockResolvedValue([
            { username: 'charlie.brown', uid: '730b0412-72c7-11e9-a923-1681be663d3e' },
            { username: 'james.bond', uid: '730b06a6-72c7-11e9-a923-1681be663d3e' }
        ]);

        getUserProfiles.mockResolvedValue([
            { userUid: '730b0412-72c7-11e9-a923-1681be663d3e', address: '219-1130, Ikanikeisaiganaibaai, Musashino-shi, Tokyo', birthdate: '2017/12/05' },
            { userUid: '730b06a6-72c7-11e9-a923-1681be663d3e', address: '365-1095, Minowada, Shirataka-machi Nishiokitama-gun, Yamagata', birthdate: '1987/01/01' }
        ]);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('should return 200 and success message for valid request', async () => {
        const response = await request(server).post('/api/submit').send({ userid: 'charlie.brown', wish: 'A new bike' });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Wish submitted successfully for 219-1130, Ikanikeisaiganaibaai, Musashino-shi, Tokyo!');
    });

    test('should return 400 if user ID is missing', async () => {
        const response = await request(server).post('/api/submit').send({ wish: 'A new bike' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Both user ID and wish are required.');
    });

    test('should return 400 if wish is missing', async () => {
        const response = await request(server).post('/api/submit').send({ userid: 'charlie.brown' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Both user ID and wish are required.');
    });

    test('should return 400 if wish exceeds 100 character limit', async () => {
        const longWish = 'A'.repeat(101);
        const response = await request(server).post('/api/submit').send({ userid: 'charlie.brown', wish: longWish });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Wish exceeds 100 character limit.');
    });

    test('should return 400 if user is not found', async () => {
        const response = await request(server).post('/api/submit').send({ userid: 'unknown.user', wish: 'A new bike' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 400 if user is too old', async () => {
        const response = await request(server).post('/api/submit').send({ userid: 'james.bond', wish: 'A new bike' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('User is too old for this event');
    });
});
