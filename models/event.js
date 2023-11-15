const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Please enter a name for the event'], unique: true},
    price: { type: Number, required: [true, 'Please enter a price (0 for free pass)']},
    description: { type: String, required: [true, 'Please enter a description for the event']}
    //User that created the event
    //user: { type: String, required: [true, 'id of the user']},
});




module.exports = mongoose.model('event', userSchema);