const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_ADDR).then(()=>{
    console.log('Connection successful');
}).catch((err)=>{
    console.log(err);
    process.exit(-1);
});

const session = require('express-session');
app.use(session({
    key: "user_sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 48000000,
        httpOnly: false
    }
}));

app.use(cors({
    origin: "http://localhost:3000"
}));
app.use(express.json());

// User APIs
app.use('/user/auth', require('./route/user/auth'));
app.use('/user/project', require('./route/user/project'));

// Client APIs
app.use('/client/auth', require('./route/user/auth'));

// Admin APIs
app.use('/admin/auth', require('./route/admin/auth'));
app.use('/admin/user', require('./route/admin/user'));
app.use('/admin/client', require('./route/admin/client'));
app.use('/admin/profile', require('./route/admin/profile'));
app.use('/admin/project', require('./route/admin/project'));
app.use('/admin/department', require('./route/admin/department'))

// Common
app.get('/auth/logout', (req, res)=>{
    req.session.destroy();
    res.json({'status':'success'});
});

/*
// Test apis start
const { User, Admin } = require('./model/userSchema');

app.get('/auth_check', (req, res)=>{
    res.json({'status':req.session});
});

app.post('/user_signup', async (req, res)=>{
    const test = new User(req.body);
    await test.save();
    res.json({'status':'success'});
});

app.post('/admin_signup', async (req, res)=>{
    const test = new Admin(req.body);
    await test.save();
    res.json({'status':'success'});
});
// Test apis end
*/

app.get('/', (req, res)=>{
    console.log(req.sessionID);
    res.send("Hi");
});

app.listen(process.env.PORT, ()=>{
  console.log("Server Started at port:", process.env.PORT);
});
