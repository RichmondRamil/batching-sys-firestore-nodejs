const CronJob = require("cron").CronJob;
const admin = require("firebase-admin");
const credentials = require("./key.json");
const axios = require("axios");
const ts = require("firebase-admin/firestore");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();

const job = new CronJob("1 * * * * *", async function () {
  try {
    await postRecords();
  } catch (error) {
    console.log(error);
  }
});

job.start();

const generateRecords = async () => {
  // Modify the code to retrieve the Firestore collection length using db
  const collectionRef = db.collection("userRequestData");
  const snapshot = await collectionRef.get();
  const dbLength = snapshot.size;

  const records = [];

  for (let i = 0; i < 333; i++) {
    const id = dbLength + i;
    const record = {
      id,
      __metadata: {
        jName: "CJBA Release v2.0",
        jVer: "vTest1",
      },
      "input-0": 200,
      "input-1": "Daily Race Token",
      "input-2": "1871",
      "input-3": "331",
      requestDate: ts.FieldValue.serverTimestamp(),
      status: 1,
    };
    records.push(record);
  }

  return records;
};

const postRecords = async () => {
  try {
    const generatedRecords = await generateRecords();
    console.log(generatedRecords);

    await axios.post("http://localhost:5050/requests", generatedRecords);
  } catch (error) {
    console.error("Error:", error.response.data.message);
  }
};
