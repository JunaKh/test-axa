const axios = require('axios');

async function getUsers() {
    const response = await axios.get('https://raw.githubusercontent.com/alj-devops/santa-data/master/users.json');
    return response.data;
}

async function getUserProfiles() {
    const response = await axios.get('https://raw.githubusercontent.com/alj-devops/santa-data/master/userProfiles.json');
    return response.data;
}

module.exports = {
    getUsers,
    getUserProfiles
};
