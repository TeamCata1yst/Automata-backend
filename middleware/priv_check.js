const { User, Client, Admin } = require('../model/userSchema')
const jwt = require('jsonwebtoken')


const isAdmin = (req, res, next)=>{
    const token = req.header('Token');
    try {
        let verify = jwt.verify(token, process.env.SECRET)
        if(verify.admin) {
            req.session = verify;
            next();
        } else {
            res.json({'status':'failed', 'error':'insufficient privileges'}); 
        }
    } catch(error) {
        res.json({'status':'failed', 'error':'insufficient privileges'});
    }
};


const isUser = (req, res, next)=>{
    const token = req.header('Token');
    try {
        let verify = jwt.verify(token, process.env.SECRET)
        if(verify.user) {
            req.session = verify;
            next();
        } else {
            res.json({'status':'failed', 'error':'insufficient privileges'}); 
        }
    } catch(error) {
        res.json({'status':'failed', 'error':'insufficient privileges'});
    }
};


const isClient = (req, res, next)=>{
    const token = req.header('Token');
    try {
        let verify = jwt.verify(token, process.env.SECRET)
        if(verify.client) {
            req.session = verify;
            next();
        } else {
            res.json({'status':'failed', 'error':'insufficient privileges'}); 
        }
    } catch(error) {
        res.json({'status':'failed', 'error':'insufficient privileges'});
    }
};

module.exports = { isAdmin, isUser, isClient };
