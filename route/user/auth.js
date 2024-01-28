const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../../model/userSchema");

router.post('/login', (req, res) => {
    try{
        console.log(req.body)
        const {email, password} = req.body;
        const email_verify = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.exec(email);
        if(email_verify){
            User.findOne({email: email_verify[0]})
                .exec()
                .then(user => {
                    if (!user){
                        return res.status(401).json({ 'status':'failed', 'error':'invalid credentials' });
                    }
                    if(password == user.password) {
                        req.session.regenerate(()=>{
                                req.session.user_verified = true;
                                req.session.user = { id: user.id, name: user.name, department: user.department, gender: user.gender, email: user.email, mobile_no: user.mobile_no };
                            });
                        return res.status(200).json({ 'status':'success' });
                    } else {
                        res.status(401).json({ 'status':'failed', 'error':'invalid credentials' });
                    }
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).json({ 'status':'failed', 'error':'internal error' });
            });
        } else{
            res.json({'status':'failed', 'error':'wrong input'});
        }
    } catch(error){
        console.log({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
