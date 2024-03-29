const router = require('express').Router();
const { User, Department } = require('../../model/userSchema');
const { Project } = require('../../model/projectSchema');
const { isAdmin } = require('../../middleware/priv_check');


router.get('/', isAdmin, async (_, res) => {
    try {
	const users = await User.find({});
	return res.status(200).json({'status':'success', 'result': users});
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.get('/:dep_name', isAdmin, async (req, res)=>{
    try{
	const { dep_name } = req.params;
	const depExist = await Department.findOne({company: 'company', department: { $elemMatch:{ name: dep_name } }});
	if(!depExist) {
	    return res.status(404).json({'status':'failed', 'error':'department does not exist'});
	}
	const result = await User.find({ department: dep_name });
	
	res.json({ 'status':'success', 'result': result });
	console.log(result);
    } catch(error){
        console.log(error);
        res.status(500).json({ 'status':'failed', 'error':'internal error' });
    }
});

router.post('/create', isAdmin, async (req, res)=>{
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

router.post('/delete', isAdmin, async (req, res)=>{
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

router.post('/tasks', isAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        
        const projects = await Project.find({ resources: id });
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
