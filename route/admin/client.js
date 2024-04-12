const router = require('express').Router();
const { Client } = require('../../model/userSchema');
const { isAdmin } = require('../../middleware/priv_check');

router.get('/', isAdmin, async (req, res)=>{
    try{
        const list = await Client.find({ company: req.session.company });
        res.json({ 'status':'success', 'result': list });
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/create', isAdmin, async (req, res)=>{
    try{
        const { name, email, mobile_no } = req.body;
        
        if(!name || !email || !mobile_no ){
            console.log(req.body);
            return res.json({'status':'failed', 'error':'missing parameters'});
        }
        const client = new Client({ name, email, mobile_no, company: req.session.company });
        await client.save();
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/edit', isAdmin, async (req, res)=>{
    try{
        const { id, name, email, mobile_no, password } = req.body;
        await Client.findOneAndUpdate({ id, company: req.session.company }, { name, email, mobile_no, password });
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
