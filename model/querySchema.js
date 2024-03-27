const mongoose = require('mongoose')
const {v4: uuidv4 } = require('uuid')

const schema = new mongoose.Schema({
    id: {
        type: String
    },
    client_id: {
        type: String
    },
    project_id: {
        type: String
    },
    subject: {
        type: String
    },
    description:{
        type: String
    },
    remark: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    }
});

schema.pre('save', function() {
    this.id = uuidv4();
})

const Query = mongoose.model('queries', schema)
module.exports = { Query }
