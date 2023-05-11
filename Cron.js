const CronJob = require('cron').CronJob;
const axios = require('axios');
const { format } = require('date-fns');

const job = new CronJob('1 * * * * *', async function () {
    try {
        const { data: userRequests } = await axios.get('http://localhost:5050/requests');
        const { exceedsRequest, needsToProcess } = separateDataByAttempt(userRequests);

        if (needsToProcess.length || exceedsRequest.length) {
            let successArr = [];
            let errorArr = [];
            for (let i = 0; i < needsToProcess.length; i += 10) {
                const chunks = needsToProcess.slice(i, i + 10);

                const { status } = await axios.post(
                    'https://webhook.site/e7fb8853-a7af-45f4-8a30-64b429cd9131',
                    { chunks },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (status === 200) {
                    successArr.push(...chunks);
                }

                if (status === 400) {
                    errorArr.push(...chunks);
                }
            }

            console.log(exceedsRequest); // Needs to proccess for Alert 'Exceeds the limit of 10'

            await processBatchResults(successArr, errorArr);
            await axios.delete('http://localhost:5050/requests');
            dateTimeResponse();
        }
    } catch (error) {
        console.log(error);
    }
});

job.start();

function updateStatus(records, status) {
    const updatedRecords = records.map((record) => ({
        ...record,
        numOfReqAttempt: record.numOfReqAttempt + 1,
        status: status,
    }));
    return updatedRecords;
}

function dateTimeResponse() {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`;
    return console.log(dateTime);
}

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

async function processBatchResults(successArr, errorArr) {
    if (successArr.length) {
        const updatedStatus = updateStatus(successArr, 2);
        const { data } = axios.put('http://localhost:5050/requests', updatedStatus);
        return data;
    }

    if (errorArr.length) {
        const updatedStatus = updateStatus(successArr, 3);
        const { data } = axios.put('http://localhost:5050/requests', updatedStatus);
        return data;
    }
}
