const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Client } = require("../../model/userSchema");

router.post('/login', (req, res) => {
    try{
        const { user, password } = req.body;
        const email_verify = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.exec(user);
        if(email_verify){
            Client.findOne({email: email_verify[0]})
                .exec()
                .then(user => {
                    if (!user){
                        return res.status(401).json({ 'status':'failed', 'error':'invalid credentials' });
                    }
                    bcrypt.compare(password, user.password, (err, result) => {
                        if (err) {
                            return res.status(401).json({ 'status':'failed', 'error':'invalid credentials' });
                        }
                        if (result) {
                            req.session.regenerate((_)=>{
                                req.session.client_verified = true;
                                req.session.client = { id: user.id , firstname: user.firstname, lastname: user.lastname, email: user.email };
                            });
                            return res.status(200).json({ 'status':'success' });
                        }
                        res.status(401).json({ 'status':'failed', 'error':'invalid credentials' });
                    });
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
