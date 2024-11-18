 const express = require('express');
const userController = require('../controllers/user');
const passport = require('passport');
const { verify, verifyAdmin } = require('../auth');

const router = express.Router();






// Routes

router.post('/register', userController.registerUser);


router.post('/login', userController.loginUser);


router.get('/details', verify, userController.getProfile);


router.patch('/:id/set-as-admin', verify, verifyAdmin, userController.updateUser);


router.patch('/update-password', verify, userController.updatePassword);


module.exports = router;