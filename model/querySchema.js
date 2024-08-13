const mongoose = require('mongoose')
const {v4: uuidv4 } = require('uuid')

const schema = new mongoose.Schema({
    id: {
        type: String
    },
    company: {
        type: String
    },
    client_id: {
        type: String,
        default: "NONE"
    },
    by_admin: {
        type: Boolean,
        default: false
    },
    project_id: {
        type: String
    },
    resource_id: {
        type: String
    },
    resource_remark: {
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
    init_date: {
        type: Date
    },
    resolve_date: {
        type: Date
    },
    status: {  // 0=query_rasied, 1=query_closed, 2=task_created, 3=task_resolved
        type: Number,
        default: 0
    },
    task_status: {
        type: Number,
        default: 0
    },
    task: {
        before_id: {
            type: Number
        },
        name: {
            type: String
        },
        time_req: {
            type: Number
        },
        checklist: [],
        init_time: {
            type: Date
        },
        selected_resource: {
            type: String
        },
        status: {
            type: Number,
            default: 0
        }
    }
});

schema.pre('save', function() {
    this.id = uuidv4();
    this.init_date = Date.now();
})

const Query = mongoose.model('queries', schema)
module.exports = { Query }
