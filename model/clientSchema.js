const mongoose = require('mongoose')

const querySchema = mongoose.Schema({
    client_id: {
        type: String
    },
    query: {
        type: String,
        required: true
    },
    response: {
        type: String
    }
});

const Query = mongoose.model('queries', querySchema)

module.exports = { Query }
