const experss = require('express');
const router = experss.Router();
const userRequetsController = require('../../controllers/userRequestsController');

router
    .route('/')
    .get(userRequetsController.getAllUserRequest)
    .post(userRequetsController.createUserRequest)
    .put(userRequetsController.updateUserRequest)
    .delete(userRequetsController.deleteUserRequest);

router.route('/:id').get(userRequetsController.getUserRequest);

module.exports = router;
