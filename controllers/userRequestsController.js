const admin = require('firebase-admin');
const db = admin.firestore();
// const batch = db.batch();
// const ts = require('firebase-admin/firestore');

const getAllUserRequest = async (req, res) => {
    try {
        const snapshot = await db
            .collection('userRequestData')
            .where('status', 'in', [1, 3])
            .orderBy('id', 'asc')
            .limit(200)
            .get();
        const documents = snapshot.docs.map((doc) => doc.data());

        res.status(200).json(documents);
    } catch (error) {
        res.json({ message: error });
    }
};

const createUserRequest = async (req, res) => {
    try {
        const snapshot = await db.collection('userRequestData').get();
        const documents = snapshot.docs.map((doc) => doc.data());
        if (
            !req.body?.__metadata.jName ||
            !req.body?.__metadata.jVer ||
            !req.body?.['input-0'] ||
            !req.body?.['input-1'] ||
            !req.body?.['input-2'] ||
            !req.body?.['input-3'] ||
            !req.body?.status
        ) {
            return res.status(400).json({ message: 'Inputs required' });
        }
        const userRequests = {
            id: documents.length + 1,
            __metadata: {
                jName: req.body.__metadata.jName,
                jVer: req.body.__metadata.jVer,
            },
            'input-0': req.body['input-0'],
            'input-1': req.body['input-1'],
            'input-2': req.body['input-2'],
            'input-3': req.body['input-3'],
            status: 1,
        };
        const response = await db.collection('userRequestData').doc().set(userRequests);
        res.status(201).json(response);

        // Accepts Only 500 records will
        // const array =

        // array.forEach((doc) => {
        //     var docRef = db.collection('userRequestData').doc(); //automatically generate unique id
        //     batch.set(docRef, doc);
        // });

        // batch.commit();
    } catch (error) {
        res.json({ message: error });
    }
};

const updateUserRequest = async (req, res) => {
    const updatedData = req.body;
    try {
        // Iterate over each object in the array and update Firestore documents sequentially
        for (const obj of updatedData) {
            const identifier = obj.id;

            // Query Firestore to retrieve the document that matches the identifier
            const querySnapshot = await db.collection('userRequestData').where('id', '==', identifier).limit(1).get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;

                // Update the document with the new data
                await docRef.update(obj);

                console.log(`Document with ID ${docRef.id} has been updated.`);
            }
        }

        res.status(200).json({ message: 'Documents updated successfully.' });
    } catch (error) {
        console.error('Error updating documents:', error);
        res.status(500).json({ error: 'An error occurred while updating documents.' });
    }
};

const deleteUserRequest = async (req, res) => {};

const getUserRequest = async (req, res) => {
    try {
        const userReqQuery = db.collection('userRequestData').where('id', '==', parseInt(req.params.id));
        const userReqSnapshot = await userReqQuery.get();

        if (userReqSnapshot.empty) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = userReqSnapshot.docs[0].data();
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
};

module.exports = {
    getAllUserRequest,
    createUserRequest,
    updateUserRequest,
    deleteUserRequest,
    getUserRequest,
};
