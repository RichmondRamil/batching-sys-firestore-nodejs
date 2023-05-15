const CronJob = require('cron').CronJob;
const axios = require('axios');

const job = new CronJob('0 8 * * *', async function () {
    try {
        await axios.delete('http://localhost:5050/requests'); // needs to run everyday
    } catch (error) {
        console.log(error);
    }
});

job.start();
