const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');
const {createToken} = require('../utils/utils');
const bcrypt = require('bcrypt');

router.get('/signup', (req, res) => { 
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    try {
    catch (ex) {
        console.log(ex);
        res.status(400).send('Error, user not created');
    }
});


router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => { 
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Password is incorrect');
        }

        // Create and send token
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ user: user._id });
    } catch (ex) {
        console.log(ex);
        res.status(400).send('Login error');
    }
});



//Not finished!!!
// router.put('/profile/edit', async (req, res) => {
//     const {email, password} = req.body;
//     try {
//             const user = await User.findByIdAndUpdate(req.user._id, {email, password});
//             res.status(200).json({user: user._id});
//      } catch(ex) {
//         console.log(ex);
//         res.status(400).send('Error, user not updated');
//     }
// });

// router.delete('/profile/delete', async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.user._id);
//         res.status(200).json({user: user._id});
//     } catch(ex) {
//         console.log(ex);
//         res.status(400).send('Error, user not deleted');
//     }
// });

module.exports = router;