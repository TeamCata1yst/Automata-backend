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
    client_name:{
	type: String,
	required: true
    },
    resources:[
	{
	    department: {
		type: String
	    },
	    users:{
		type: Array
	    }
	}
    ],
    status:{
	type: Boolean,
	default: false
    },
    date:{
	type: Date,
	required: true
    },
    buffer:{
	type: Date,
	required: true
    },
    priority:{
	type: Boolean,
	default: false
    },
    process:{
	type: String,
	required: true
    }
});
	
const templateSchema = new mongoose.Schema({
    name:{
	type: String,
	required: true
    },
    time:{
	type: Date,
	required: true
    },
    process:[]
});

projectSchema.pre('save', async function(){
    this.id = uuidv4();
});

const Project = mongoose.model('projects', projectSchema);
const Template = mongoose.model('templates', templateSchema);
module.exports = { Project, Template };
