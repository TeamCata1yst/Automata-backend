const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const { Admin } = require("../../model/userSchema");

router.post("/", (req, res) => {
    try{
        const { email, password } = req.body;
        const email_verify = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.exec(email);
        if(email_verify){
            Admin.findOne({email: email_verify[0]})
                .exec()
                .then(user => {
                    if (!user) {
                        return res.status(401).json({ 'status':'success', 'error':'invalid credentials' });
                    }
                    
                    if (password == user.password) {
                        var data = { admin: true, name: user.name, email: user.email, company_info: false };
                        if(user.company != "")
                            data.company_info = true
                            data.company = user.company
                        var token = jwt.sign(data, process.env.SECRET);
                        return res.status(200).json({ 'status':'success', 'Token': token });
                    }
                    res.status(401).json({ 'status':'success', 'error':'invalid credentials' });
                    
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ 'status':'success', 'error':'invalid credentials' });
            });
        } else{
            res.json({'status':'failed', 'error':'wrong input'});
        }
    } catch(error){
        console.log({'status':'failed', 'error':'internal error'});
    }
});

router.post("/signup", async (req, res) => {
    try{
        const { email, password, name } = req.body;
        const email_verify = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.exec(email);
        if(email_verify){
            var a = await Admin.findOne({ email })
            if(a) {
                return res.json({'status':'failed', 'error':'email exists'})
            }
            var admin = new Admin({ email, password, name })
            await admin.save()
            res.json({'status':'success'})
        } else{
            res.json({'status':'failed', 'error':'wrong input'});
        }
    } catch(error){
        console.log({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
