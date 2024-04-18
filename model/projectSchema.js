const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const projectSchema = new mongoose.Schema({
    id:{
	type: String
    },
    name:{
	type: String,
	required: true
    },
    company: {
        type: String
    },
    client:{
	type: String,
	required: true
    },
    client_id: {
        type: String,
        required: true
    },
    resources:[],
    status:{
	type: Boolean,
	default: false
    },
    date:{
	type: Date// Number,
	
    },
    buffer:{
	type: Number,
	required: true
    },
    deadline:{
	type: Date,
	required: true
    },
    no_buffer_deadline:{
	type: Date,
	required: true
    },
    priority:{
	type: Number
    },
    template:{
	type: String,
	required: true
    },
    buffer_deadline:{
        type: String
    },
    process:[]
});
	
const templateSchema = new mongoose.Schema({
    name:{
	type: String,
	required: true
    },
    company: {
        type: String
    },
    time:{
	type: Number
    },
    milestones: [],
    process:[]
});

projectSchema.pre('save', async function(){
    this.id = uuidv4();
    this.date = Date.now();
});

const Project = mongoose.model('projects', projectSchema);
const Template = mongoose.model('templates', templateSchema);

module.exports = { Project, Template };
