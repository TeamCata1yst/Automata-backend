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
        type: String
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

userSchema.pre("save", async function(next){
    this.id = uuidv4();
    next();
});


// Client
const clientSchema = new mongoose.Schema({
    id:{
        type: String
    },
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile_no:{
        type: String,
        required: true
    },
    password:{
        type: String,
    
    }
});

clientSchema.pre("save", async function(next){
    this.id = uuidv4();
    
    var password = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var length = characters.length;
    for (var i = 0; i < 12; i++) {
        password += characters.charAt(Math.floor(Math.random() * length));
    }

    this.password = password;
    next();
});

// Admin
const adminSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
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
        this.password = await bcrypt.hash(this.password, 16);
    }
    next();
});

adminSchema.pre("save", async function(next){;
    this.password = await bcrypt.hash(this.password, 16);
    next();
});

// Collection Objects
const User = mongoose.model('user', userSchema);
const Admin = mongoose.model('admin', adminSchema);
const Client = mongoose.model('client', clientSchema);
const Department = mongoose.model('department', departSchema);

module.exports = { User, Admin, Client, Department };
