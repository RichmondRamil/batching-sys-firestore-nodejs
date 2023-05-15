const admin = require('firebase-admin');
const db = admin.firestore();

const getAllUserRequest = async (req, res) => {
    try {
        const snapshot = await db
            .collection('userRequestData')
            .where('status', 'in', [1, 3])
            .orderBy('id', 'asc')
            .limit(20)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'There is no Available request' });
        }
        const documents = snapshot.docs.map((doc) => doc.data());

        res.status(200).json(documents);
    } catch (error) {
        res.json({ message: error });
    }
};

const createUserRequest = async (req, res) => {
    try {
        // Accepts Only 500 records will
        const batch = db.batch();
        const array = req.body;
        array.forEach((doc) => {
            var docRef = db.collection('userRequestData').doc(); //automatically generate unique id
            batch.set(docRef, doc);
        });
        batch.commit();
        res.StatusCode(200).json({ message: 'Records added successfully' });
    } catch (error) {
        res.json({ message: error });
    }
};

const updateUserRequest = async (req, res) => {
    const updatedData = req.body;
    try {
        for (const obj of updatedData) {
            const identifier = obj.id;

            const querySnapshot = await db.collection('userRequestData').where('id', '==', identifier).limit(1).get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;

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

const deleteUserRequest = async (req, res) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
        const snapshot = await db.collection('userRequestData').where('requestData', '>=', oneWeekAgo).get();

        if (snapshot.empty) {
            res.status(200).json({ message: 'No matching records found.' });
            return;
        }

        for (const doc of snapshot.docs) {
            try {
                await doc.ref.delete();
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }

        res.status(200).json({ message: 'Matching records deleted successfully.' });
    } catch (error) {
        console.error('Error deleting records:', error);
        res.status(500).json({ error: 'Failed to delete records.' });
    }
};

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
