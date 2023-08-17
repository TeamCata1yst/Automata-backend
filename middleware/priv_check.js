const isAdmin = (req, res, next)=>{
    if(req.session.admin_verified){
        return next();
    }
    res.json({'status':'failed', 'error':'insufficient privileges'});
};

const isUser = (req, res, next)=>{
    if(req.session.user_verified){
        return next();
    }
    res.json({'status':'failed', 'error':'insufficient privileges'});
};

const isClient = (req, res, next)=>{
    if(req.session.client_verified){
        return next();
    }
    res.json({'status':'failed', 'error':'insufficient privileges'});
};

module.exports = { isAdmin, isUser, isClient };
