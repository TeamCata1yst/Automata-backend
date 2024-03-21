const mongoose = require('mongoose')
const {v4: uuidv4 } = require('uuid')

const schema = mongoose.Schema({
    id: {
        type: String
    },
    client: {
        type: String
    },
    project_id: {
        type: string
    },
    query: {
        type: String
    },
    status: {
        type: Boolean
    }
});

schema.pre('save', (next) => {
    this.id = uuidv4()
})

const Query = new mongoose.model('queries', schema)
module.exports = { Query }
