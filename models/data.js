const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create a schema for our links
let dataSchema = new Schema({
    user: String,
    headers: String,
    opened_at: Date
});

dataSchema.pre('save', function(next){
    let doc = this;
    doc.opened_at = new Date();
    next();
});

let Data = mongoose.model('data', dataSchema);

module.exports = Data;
