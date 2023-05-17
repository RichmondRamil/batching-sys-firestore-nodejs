const CronJob = require('cron').CronJob;
const axios = require('axios');

const path = require('path');
const Firestore = require('@google-cloud/firestore');
const db = new Firestore({
    projectId: 'firestore-nodejs-386808',
    keyFilename: path.join(__dirname, './key.json'),
});

const job = new CronJob('*/5 * * * * *', async function () {
    try {
        await postRecords();
    } catch (error) {
        console.log(error);
    }
});

job.start();

const generateRecords = async () => {
    // Modify the code to retrieve the Firestore collection length using db
    const collectionRef = db.collection('userRequestData');
    const snapshot = await collectionRef.get();
    const dbLength = snapshot.size;

    const records = [];
    const limit = 500;

    // Iterates until limit to create record and push inside array
    for (let i = 0; i < limit; i++) {
        const id = dbLength + i;
        const record = {
            id,
            __metadata: {
                jName: 'CJBA Release v2.0',
                jVer: 'vTest1',
            },
            'input-0': 200,
            'input-1': 'Daily Race Token',
            'input-2': '1871',
            'input-3': '331',
            numOfReqAttemp: 0,
            status: 1,
        };
        records.push(record);
    }

    return records;
};

const postRecords = async () => {
    try {
        const generatedRecords = await generateRecords();

        // Posts the records generated to endpoint which handles the payload to firestore
        await axios.post('http://localhost:5050/requests', generatedRecords);
    } catch (error) {
        console.error('Error:', error);
    }
};
