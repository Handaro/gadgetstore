const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth');
const { errorHandler } = require('../auth');


module.exports.registerUser = (req, res) => {
    let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        mobileNo: req.body.mobileNo,

        password: bcrypt.hashSync(req.body.password, 10)
    });

    const isValidMobileNo = (mobileNo) => {
        return mobileNo.length ===11;
    };

    const isValidEmail = (email) => {
        return email.includes('@');         
    };

    const isValidPassword = (password) => {
        return password.length >= 8;
    };

    const { firstName, lastName, email, mobileNo, password } = req.body;

    if(!isValidEmail(email)) {
        return res.status(400).send({ error: 'Email invalid'});
    } else if(!isValidMobileNo(mobileNo)) {
        return res.status(400).send({ error: 'Mobile number invalid'});
    } else if(!isValidPassword(password)) {
        return res.status(400).send({ error: 'Password must be atleast 8 characters'});
    }

    return newUser.save()
    .then((result) => res.status(201).send({ message: 'Registered Successfully'}))
    .catch(err => errorHandler(err, req, res))
};

module.exports.loginUser = (req, res) => {
    if(!req.body.email.includes('@')) {
        return res.status(400).send({ error: 'Invalid email'});
    }

    return User.findOne({ email: req.body.email })
    .then((result) => {
        if (!result) {
            return res.status(404).send({ error: 'No email found' });
        } else {
            const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
            if (isPasswordCorrect) {
                return res.status(200).send({ access : auth.createAccessToken(result)})
            } else {
                return res.status(401).send({ error: 'Email and password do not match'})
            }
        }
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then((user) => {
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        user.password = '';
        return res.status(200).send({user});
    })
    .catch((err) => errorHandler(err, req, res));
};


module.exports.updateUser = async (req, res) => {
    const { id } = req.params; // Get user ID from URL parameter
    const updateUser = { ...req.body, isAdmin: true }; // Merge req.body with isAdmin: true

    try {
        const updatedUser = await User.findByIdAndUpdate(id, updateUser, { new: true });

        if (updatedUser) {
            res.status(200).send({ updatedUser });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed in Find', details: error.message });
    }
};

// update password
module.exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.user; // Assuming you're using JWT and extracting the user ID from the token
        const { newPassword } = req.body;

        
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        
        /* const isPasswordCorrect = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).send({ error: 'Current password is incorrect' });
        } */

      
        if (newPassword.length < 8) {
            return res.status(400).send({ error: 'New password must be at least 8 characters long' });
        }

        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

       
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).send({ message: 'Password reset successfully' });

    } catch (error) {
        return res.status(404).send({ error: 'Failed to update password', details: error.message });
    }
};
