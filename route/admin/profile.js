const router = require('express').Router();
const { Admin } = require('../../model/userSchema');
const { isAdmin } = require('../../middleware/priv_check');

router.get('/', isAdmin, (req, res)=>{
    res.json({'status':'success', 'result': req.session});
});

router.post('/edit', (req, res)=>{
    try{
        const { firstname, lastname, email, password } = req.body;
        Admin.findOnaAndUpdate({email: req.session.email}, { firstname, lastname, email, password });
        req.session.admin = { firstname, lastname, email };
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.get('/company', isAdmin, (req, res)=>{
    res.json({'status':'success', 'result': req.session});
});

router.post('/edit', (req, res)=>{
    try{
        const { firstname, lastname, email, password } = req.body;
        Admin.findOnaAndUpdate({email: req.session.email}, { firstname, lastname, email, password });
        req.session.admin = { firstname, lastname, email };
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
