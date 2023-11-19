const { Router } = require('express');
const router = Router();
const Event = require('../models/event');
require('dotenv').config()

router.get('/events/create', (req, res) => { 
    res.render('eventCreate');
});

router.post('/events/create', async (req, res) => {
    try {
        const {name, price, description} = req.body;
        const event = await Event.create({name, price, description});
        res.status(201).json({event: event._id});
    }
    catch(ex) {
        console.log(ex);
        res.status(400).send('Error, event not created');
    }
});

router.get('/events/view', async (req, res) => { 
    // Get data from database
    try {
        const data = await Event.find({})

        res.render('eventView', {data});
    } catch (e) {
        res.status(500).send('Error fetching data');
        console.log(e);
    } 
});

router.get('/events/edit/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const data = await Event.findOne({ _id: id })

        res.render('eventEdit', {data});
    } catch (e) {
        res.status(500).send('Error fetching data');
        console.log(e);
    } 
});

router.put('/events/edit/:id', async (req, res) => {
    const id = req.params.id    ;
    const updates = { name: req.body.name, price: req.body.price, description: req.body.description};

    try {
        const updatedEvent = await Event.findByIdAndUpdate(id, updates, {new: true});

        console.log("Updated Event: ", updatedEvent)

        res.status(200).send('/events/view');
    } catch (e) {
        res.status(500).send('Error fetching data');
        console.log(e);
    }
});


router.get('/events/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const data = await Event.findOne({ _id: id })

        res.render('eventDelete', {data});
    } catch (e) {
        res.status(500).send('Error fetching data');
        console.log(e);
    } 
});

router.delete('/events/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedEvent = await Event.findByIdAndDelete(id, {delete: true});

        if (!deletedEvent) {
            return res.status(404).send('Event not found');
        }

        console.log("Event Deleted");

        res.status(200).send('/events/view');
    } catch (e) {
        res.status(500).send('Error fetching data');
        console.log(e);
    } 
});

module.exports = router;