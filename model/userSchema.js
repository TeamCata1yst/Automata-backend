const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const departSchema = new mongoose.Schema({
    company:{
	type: String,
	required: true
    },
    department:[{
	name:{
	    type: String,
	    required: true
	},
	users:{
	    type: Array,
	    default:[]
	}
    },]
});

// User
const userSchema = new mongoose.Schema({
    id:{
        type: String,
        default: uuidv4()
    },
    name:{
        type: String,
        required: true
    },
    gender:{
	type: Boolean,  //0 == male, 1 == female
	required: true
    },
    department:{
	type: String,
	required: true
    },
    email:{
        type: String,
        required: true
    },
    mobile_no:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
});
/*
userSchema.pre('findOneAndUpdate', async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 16);
    }
    next();
});
*/
userSchema.pre("save", async function(next){
    this.id = uuidv4();
    next();
});

// Admin
const adminSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: false
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
});

adminSchema.pre('findOneAndUpdate', async function(next){
    if(this.isModified("password")){
        this.password = bcrypt.hash(this.password, 16);
    }
    next();
});

adminSchema.pre("save", async function(next){;
    if(this.isModified("password")){
        this.password = bcrypt.hash(this.password, 16);
    }
    next();
});

const User = mongoose.model('user', userSchema);
const Admin = mongoose.model('admin', adminSchema);
const Client = mongoose.model('client', userSchema);
const Department = mongoose.model('department', departSchema);

module.exports = { User, Admin, Client, Department };
