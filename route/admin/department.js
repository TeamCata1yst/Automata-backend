const router = require('express').Router();
const { Department } = require('../../model/userSchema');
//const Project = require('../../model/projectSchema');
const { isAdmin } = require('../../middleware/priv_check');

router.get('/', async (req, res)=>{
    try{
        const list = await Department.findOne({ company: 'company'});
        res.json({ 'status':'success', 'result': list.department });
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/create', async (req, res)=>{
    try{
        const { name } = req.body;
        if(!name){
            console.log(req.body);
            return res.json({'status':'failed', 'error':'missing parameters'});
        }
        await Department.findOneAndUpdate({ company: "company"}, { $push:{ department: { name } } });
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/delete', async (req, res)=>{
    try{
        const { name } = req.body;
        if(!name){
            console.log(req.body);
            return res.json({'status':'failed', 'error':'missing parameters'});
        }
        await Department.findOneAndUpdate({ company: "company"}, { $pull:{ department: { name } } });
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});



module.exports = router;
