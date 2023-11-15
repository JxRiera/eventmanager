const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');
const {createToken} = require('../utils/utils');

router.get('/signup', (req, res) => { 
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    try {
        const {email, type, password} = req.body;
        const user = await User.create({email, type, password});
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000})
        res.status(201).json({user: user._id});
    }
    catch(ex) {
        console.log(ex);
        res.status(400).send('Error, user not created');
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