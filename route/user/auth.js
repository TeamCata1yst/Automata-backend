const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User } = require("../../model/userSchema");

router.post('/login', (req, res) => {
    try{
        console.log(req.body)
        const { mobile_no, password } = req.body;
            User.findOne({ mobile_no })
                .exec()
                .then(user => {
                    if (!user){
                        return res.status(401).json({ 'status':'failed', 'error':'invalid credentials' });
                    }
                    console.log(user.password)
                    if(password == user.password) {
                        var data = { user: true, id: user.id, name: user.name, department: user.department, gender: user.gender, email: user.email, mobile_no: user.mobile_no };
                        var token = jwt.sign(data, process.env.SECRET)
                        return res.status(200).json({ 'status':'success', 'Token': token });
                    } else {
                        res.status(401).json({ 'status':'failed', 'error':'invalid credentials' });
                    }
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).json({ 'status':'failed', 'error':'internal error' });
            });
        
    } catch(error){
        console.log({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
