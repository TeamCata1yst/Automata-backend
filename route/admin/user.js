const router = require('express').Router();
const { User, Department } = require('../../model/userSchema');
const { Project } = require('../../model/projectSchema');
const { isAdmin } = require('../../middleware/priv_check');

router.get('/', isAdmin, async (req, res) => {
    try {
	const users = await User.find({ company: req.session.company });
	return res.status(200).json({'status':'success', 'result': users});
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.get('/:dep_name', isAdmin, async (req, res)=>{
    try{
	const { dep_name } = req.params;
	const depExist = await Department.findOne({company: req.session.company, department: { $elemMatch:{ name: dep_name } }});
	if(!depExist) {
	    return res.status(404).json({'status':'failed', 'error':'department does not exist'});
	}
	const result = await User.find({ department: dep_name, company: req.session.company });
	
	res.json({ 'status':'success', 'result': result });
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/create', isAdmin, async (req, res)=>{
    try{
        const { name, gender, department, email, mobile_no, password } = req.body;
        if(!name || (typeof gender == 'undefined') || !email || !department || !mobile_no || !password){
            return res.json({'status':'failed', 'error':'missing parameters'});
        }
	/*
        var password = "";
	let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var length = characters.length;
	for (var i = 0; i < 12; i++) {
	    password += characters.charAt(Math.floor(Math.random() * length));
	}
	console.log(req.body)
        */
        var result;
        var u = await User.findOne({ mobile_no, company: req.session.company });
        if(u) {
            result = await User.findOneAndUpdate({ mobile_no }, { $push: { department } }) 
        } else {
            const user = new User({ name, department, gender, email, mobile_no, password, company: req.session.company });
            result = await user.save();
        }
	await Department.findOneAndUpdate({company: req.session.company, department: {$elemMatch:{ name: department } }}, { $push:{ 'department.$.users': result.id }});
        res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/edit', isAdmin, async (req, res) => {
    try {
        const { id, name, gender, email, mobile_no, password } = req.body
        await User.findOneAndUpdate({ id, company: req.session.company}, { name, gender, email, mobile_no, password })
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({ 'status':'failed', 'error':'internal error' })
    }
})

router.post('/delete', isAdmin, async (req, res)=>{
    try{
        const { id, department } = req.body;
        if(!id || !department){
            return res.json({'status':'failed', 'error':'missing parameters'});
        } 
	const val = await User.findOne({ id, company: req.session.company });
	if(val){
            await Department.findOneAndUpdate({company: req.session.company, department: {$elemMatch:{ name: val.department } }}, { $pull:{ 'department.$.users': val.id }});
	    if(val.department.length == 1) {
                await User.findOneAndDelete({ id, company: req.session.company });
            } else {
                await User.findOneAndUpdate({ id, company: req.session.company }, { $pull: { department } });
            }
        }
	res.json({'status':'success'});
    } catch(error){
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/tasks', isAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        
        const projects = await Project.find({ resources: id, company: req.session.company });
        projects.sort((a, b)=> parseInt(a.priority) - parseInt(b.priority))
    
        const arr = [];
        projects.forEach( (project, _) => {
            project.process.forEach( (elem, _) => {
                if(elem.selected_resource == id) {
                    elem.project_name = project.name;
                    elem.project_id = project.id
                    elem.date = project.date
                    elem.priority = project.priority;

                    arr.push(elem)
                }
            });
	});
        
        res.json({'status':'success', 'result': arr});

    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

module.exports = router;
