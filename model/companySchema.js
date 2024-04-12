const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    comp_name: {
        type: String
    },
    address: {
        type: String
    },
    comp_phone: {
        type: String
    },
    start_time: {
        type: String
    },
    first_day: {
        type: String
    },
    hours: {
        type: Number
    },
    weekend: [],
    linkedin: {
        type: String
    },
    facebook: {
        type: String
    },
    instagram: {
        type: String
    },
    twitter: {
        type: String
    }
})

const Company = mongoose.model('company', schema)
module.exports = { Company }
