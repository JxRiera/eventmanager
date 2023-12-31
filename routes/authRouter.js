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
        const { email, type, password, firstname, lastname } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.send('/error/406/Email_Already_Exists/');
        } else {        
          // Create user
          const user = await User.create({ email, type, password, firstname, lastname });
  
          // Create JWT tokens
          const token = createToken(user._id);
  
          res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 }).send('ok');
        }
    }
    catch (ex) {
        console.log(ex);
        res.send('/error/400/User_Not_Created')
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
          res.send('/error/404/User_Not_Found')
        } else {
          // Compare password
          const isMatch = await bcrypt.compare(password, user.password);
                  
          if (!isMatch) {
            res.send('/error/400/Password_Is_Incorrect')
          }
          else {
            // Create and send token
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 }).send('ok');
          }
        }
    } catch (ex) {
      console.log(ex);
      res.send('/error/400/Login_Error')
    }
});

const requireAuth = async (req, res, next) => {
    const token = req.cookies.jwt;
  
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decodedToken.id };
        next();
      } catch (err) {
        res.status(403).render('error', { 
          statusCode: 403,
          errorMessage: 'Access Denied - Not authorized' 
        });
      }
    } else {
      res.status(403).render('error', { 
        statusCode: 403,
        errorMessage: 'Access Denied - Not authorized' 
      });
    }
  }

  router.post('/logout', requireAuth, (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 }).redirect("back");
  });
  router.use('/profile', requireAuth);

  router.get('/profile', async (req, res, next) => {
    const token = req.cookies.jwt;
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const id = decodedToken.id;
        const data = await User.findOne({ _id: id })
        const {email, type, firstname, lastname} = data;

        res.render('profile', {
          userEmail: email,
          userType: type,
          userFirstName: firstname,
          userLastName: lastname,
        });
      } catch(err){
        res.status(403).render('error', { 
          statusCode: 403,
          errorMessage: 'Access Denied - Not authorized' 
        });
      }
  });
  
  router.put('/profile', async (req, res) => {
    const token = req.cookies.jwt;  
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const id = decodedToken.id;
      const userData = await User.findOne({ _id: id })

      const updateData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        type: req.body.type,
        password: userData.password
      }

      // Check if the new user email already exists
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser && existingUser._id.toString() !== id.toString()) {
        res.status(201).json(updateData)
      } else {
        
        const updatedUser = await User.findOneAndUpdate({ _id: id }, updateData, { new: true });
        res.status(200).json({ user: updatedUser });
      }
    } catch (ex) {
      console.log(ex);
      res.status(500).json({ error: 'Error, user not updated' });
    }
  });
  
  router.delete('/profile', async (req, res, next) => {
    try {
      const userId = req.user._id;
      await User.findByIdAndDelete(userId);
      res.status(301).clearCookie('jwt').redirect('/')
    } catch (ex) {
      console.log(ex);
      res.status(500).json({ error: 'Error, user not deleted' });
    }
  });

module.exports = router;