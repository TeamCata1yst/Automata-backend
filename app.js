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

app.use(cors({
    origin: ["https://coral-app-he6oc.ondigitalocean.app", "http://localhost:3000", "https://7c46-182-69-178-118.ngrok-free.app"]
}));
app.use(express.json());

// User APIs
app.use('/user/auth', require('./route/user/auth'));
app.use('/user/review', require('./route/user/review'));
app.use('/user/query', require('./route/user/query'));
app.use('/user/project', require('./route/user/project'));

// Client APIs
app.use('/client/auth', require('./route/client/auth'));
app.use('/client/review', require('./route/client/review'));
app.use('/client/dashboard', require('./route/client/dashboard'));
app.use('/client/user', require('./route/client/user'));

// Admin APIs
app.use('/admin/auth', require('./route/admin/auth'));
app.use('/admin/user', require('./route/admin/user'));
app.use('/admin/client', require('./route/admin/client'));
app.use('/admin/profile', require('./route/admin/profile'));
app.use('/admin/project', require('./route/admin/project'));
app.use('/admin/review', require('./route/admin/review'));
app.use('/admin/department', require('./route/admin/department'))
app.use('/admin/query', require('./route/admin/query'));

// Org APIs
app.use('/org/', require('./route/org/app'))

app.listen(process.env.PORT, ()=>{
  console.log("Server Started at port:", process.env.PORT);
});
