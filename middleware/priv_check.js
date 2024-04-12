const { User, Client, Admin } = require('../model/userSchema')
const jwt = require('jsonwebtoken')

const isAdmin = async (req, res, next)=>{
    const token = req.header('Token');
    try {
        let verify = jwt.verify(token, process.env.SECRET)
        if(verify.admin) {
            let a = await Admin.findOne({ email: verify.email });
            if(!a)
                return res.json({'status':'unauthorized', 'error':'token expired'})
            else if(a.name != verify.name)
                return res.json({'status':'unauthorized', 'error':'token expired'})
            req.session = verify;
            next();
        } else {
            res.json({'status':'unauthorized', 'error':'insufficient privileges'}); 
        }
    } catch(error) {
        res.json({'status':'unauthorized', 'error':'insufficient privileges'});
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
