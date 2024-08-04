const { getUsers, getUserProfiles } = require('./dataService');
const axios = require('axios');

jest.mock('axios');

describe('dataService', () => {
    describe('getUsers', () => {
        it('should fetch users', async () => {
            const users = [
                { username: 'charlie.brown', uid: '730b0412-72c7-11e9-a923-1681be663d3e' },
                { username: 'james.bond', uid: '730b06a6-72c7-11e9-a923-1681be663d3e' }
            ];
            axios.get.mockResolvedValue({ data: users });

            const result = await getUsers();
            expect(result).toEqual(users);
        });
    });

    describe('getUserProfiles', () => {
        it('should fetch user profiles', async () => {
            const profiles = [
                { userUid: '730b0412-72c7-11e9-a923-1681be663d3e', birthdate: '2017/12/05' },
                { userUid: '730b06a6-72c7-11e9-a923-1681be663d3e', birthdate: '1987/01/01' }
            ];
            axios.get.mockResolvedValue({ data: profiles });

            const result = await getUserProfiles();
            expect(result).toEqual(profiles);
        });
    });
});
