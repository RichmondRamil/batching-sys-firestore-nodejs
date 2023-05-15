const CronJob = require('cron').CronJob;
const axios = require('axios');
const { format } = require('date-fns');

const batchSize = 2;

const job = new CronJob('*/1 * * * * *', async function () {
    dateTimeResponse();
    try {
        const { data: userRequests } = await axios.get('http://localhost:5050/requests');
        const { exceedsRequest, needsToProcess } = separateDataByAttempt(userRequests);

        if (needsToProcess.length || exceedsRequest.length) {
            // This will give the records = BatchSize
            const batchRecords = chunkRequest(needsToProcess, batchSize);

            // Each batchRecords will go to the post request on webhook
            batchRecords.forEach(async (batch) => {
                // This post will return an array of success & error
                const { successArr, errorArr } = await webHookPostRequest(batch);
                // This function will process the success and error array
                await processBatchResults(successArr, errorArr);
            });

            dateTimeResponse();
        }
    } catch (error) {
        console.log(error);
    }
});

job.start();

// Chunk the request by a given batchSize
// Needs to Process Param are getting 20 records on the DB
function chunkRequest(needsToProcess, batchSize) {
    let chunks;
    const arrOfChunks = [];

    for (let i = 0; i < needsToProcess.length; i += batchSize) {
        chunks = needsToProcess.slice(i, i + batchSize);
        arrOfChunks.push(chunks);
    }

    return arrOfChunks;
}

// For testing only to check the time and date after finishing the job
function dateTimeResponse() {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`;
    return console.log(dateTime);
}

// This function will separtate the needs to process array and array that exceeds the request to 10
function separateDataByAttempt(data) {
    const exceedsRequest = [];
    const needsToProcess = [];

    for (const obj of data) {
        if (obj.numOfReqAttempt === 10) {
            exceedsRequest.push(obj);
        } else {
            needsToProcess.push(obj);
        }
    }

    return { exceedsRequest, needsToProcess };
}

// Will Received a chunk or batch records to post
// Serves as a Client Api Endpoint for testing
async function webHookPostRequest(chunks) {
    let successArr = [];
    let errorArr = [];

    const { status } = await axios.post(
        'https://webhook.site/7030ea0e-b7a6-45ea-a61c-0269a222c12c',
        { chunks },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    if (status === 200) {
        successArr.push(...chunks);
    } else if (status === 400) {
        errorArr.push(...chunks);
    }

    return { successArr, errorArr };
}

// Function Update Status will get the records that needs to update on the API End point
function updateStatus(records, status) {
    const updatedRecords = records.map((record) => ({
        ...record,
        numOfReqAttempt: record.numOfReqAttempt + 1,
        status: status,
    }));
    return updatedRecords;
}

// This is the Function will Process the Success and Error array given by the Client Api Endpoint
async function processBatchResults(successArr, errorArr) {
    if (successArr.length) {
        const updatedStatus = updateStatus(successArr, 2);
        const { data } = axios.put('http://localhost:5050/requests', updatedStatus);
        return data;
    }

    if (errorArr.length) {
        const updatedStatus = updateStatus(errorArr, 3);
        const { data } = axios.put('http://localhost:5050/requests', updatedStatus);
        return data;
    }
}
