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
    client:{
	type: String,
	required: true
    },
    resources:[],
    status:{
	type: Boolean,
	default: false
    },
    date:{
	type: Date,// Number,
	required: true,
        default: Date.now()
    },
    buffer:{
	type: Number,
	required: true
    },
    deadline:{
	type: Date,
	required: true
    },
    priority:{
	type: Boolean,
	default: false
    },
    template:{
	type: String,
	required: true
    },
    process:[]
});
	
const templateSchema = new mongoose.Schema({
    name:{
	type: String,
	required: true
    },
    time:{
	type: Number,
	required: true
    },
    process:[]
});

projectSchema.pre('save', async function(){
    this.id = uuidv4();
});
/*
templateSchema.pre('save', async function(){
    this.id = uuidv4();
});

projectSchema.pre('findOneAndUpdate', async function(){
    this.id = uuidv4();
});
*/
const Project = mongoose.model('projects', projectSchema);
const Template = mongoose.model('templates', templateSchema);

module.exports = { Project, Template };
