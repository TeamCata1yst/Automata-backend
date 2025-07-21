const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Client } = require("../../model/userSchema");

router.post('/login', (req, res) => {
    try{
        const { email, password, company } = req.body;
        const email_verify = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.exec(email.toLowerCase());
        if(email_verify){
            Client.findOne({email: email_verify[0], company })
                .exec()
                .then(user => {
                    if (!user){
                        return res.status(401).json({ 'status':'failed', 'error':'invalid credentials 1' });
                    }
                    if (user.password == password) {
                        var data = { client: true, id: user.id, email: user.email, mobile_no: user.mobile_no, name: user.name, company: user.company };
                        var token = jwt.sign(data, process.env.SECRET);
                        return res.status(200).json({ 'status':'success', 'Token': token });
                    }
                    res.status(401).json({ 'status':'failed', 'error':'invalid credentials 2' });
                    
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).json({ 'status':'failed', 'error':'internal error' });
            });
        } else{
            res.json({'status':'failed', 'error':'wrong input'});
        }
    } catch(error){
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
