const router = require('express').Router();
const { Admin } = require('../../model/userSchema');
const jwt = require('jsonwebtoken');
const { isAdmin } = require('../../middleware/priv_check');

router.get('/', isAdmin, (req, res)=>{
    res.json({'status':'success', 'result': req.session});
});

router.post('/edit', isAdmin, async (req, res)=>{
    try{
        const { name, email } = req.body;
        await Admin.findOneAndUpdate({email: req.session.email}, { name, email });
        
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/edit/password', isAdmin, async (req, res)=>{
    try {
        const { new_password } = req.body
        if(new_password) {
            await Admin.findOneAndUpdate({ email: req.session.email }, { password: new_password })
        }
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

module.exports = router;
