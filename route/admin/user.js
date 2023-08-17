const router = require('express').Router();
const { User, Department } = require('../../model/userSchema');
//const Project = require('../../model/projectSchema');
const { isAdmin } = require('../../middleware/priv_check');


router.get('/', async (_, res) => {
    try {
	const users = await User.find({});
	users.forEach( (user) => {
	    delete user._doc.password;
	});
	return res.status(200).json({'status':'success', 'result': users});
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.get('/:dep_name', async (req, res)=>{
    try{
	const { dep_name } = req.params;
	const depExist = await Department.findOne({company: 'company', department: { $elemMatch:{ name: dep_name } }});
	if(!depExist) {
	    return res.status(404).json({'status':'failed', 'error':'department does not exist'});
	}
	const result = await User.find({ department: dep_name });
	if(result.length > 0) {
	    result.forEach(x => {
		delete x._doc.password;
	    });
	}
	res.json({ 'status':'success', 'result': result });
	console.log(result);
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/create', async (req, res)=>{
    try{
        const { name, gender, department, email, mobile_no } = req.body;
	console.log("Create: ") 
        if(!name || (typeof gender == 'undefined') || !email || !department || !mobile_no){
            console.log(req.body);
            return res.json({'status':'failed', 'error':'missing parameters'});
        }
	var password = "";
	let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var length = characters.length;
	for (var i = 0; i < 12; i++) {
	    password += characters.charAt(Math.floor(Math.random() * length));
	}
	console.log(req.body)
        const user = new User({ name, department, gender, email, mobile_no, password });
        const result = await user.save();
	console.log(result)
	await Department.findOneAndUpdate({company: 'company', department: {$elemMatch:{ name: department } }}, { $push:{ 'department.$.users': result.id }});
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/delete', async (req, res)=>{
    try{
        const { id } = req.body;
	console.log("Delete: ")
        if(!id){
            console.log(req.body);
            return res.json({'status':'failed', 'error':'missing parameters'});
        } 
	const val = await User.findOneAndDelete({ id });
	if(val){
	    await Department.findOneAndUpdate({company: 'company', department: {$elemMatch:{ name: val.department } }}, { $pull:{ 'department.$.users': val.id }});
	}
	res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
