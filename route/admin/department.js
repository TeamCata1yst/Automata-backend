const router = require('express').Router();
const { Department } = require('../../model/userSchema');
const { isAdmin } = require('../../middleware/priv_check');

router.get('/', isAdmin, async (req, res)=>{
    try{
        const list = await Department.findOne({ company: req.session.company });
        res.json({ 'status':'success', 'result': list.department });
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/create', isAdmin, async (req, res)=>{
    try{
        const { name } = req.body;
        if(!name){
            console.log(req.body);
            return res.json({'status':'failed', 'error':'missing parameters'});
        }
        await Department.findOneAndUpdate({ company: req.session.company }, { $push:{ department: { name: name.trim() } } });
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/delete', isAdmin, async (req, res)=>{
    try{
        const { name } = req.body;
        if(!name){
            console.log(req.body);
            return res.json({'status':'failed', 'error':'missing parameters'});
        }
        await Department.findOneAndUpdate({ company: req.session.company }, { $pull:{ department: { name } } });
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});



module.exports = router;
