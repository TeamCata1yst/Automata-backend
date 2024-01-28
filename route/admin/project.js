const router = require('express').Router();
const { Project, Template } = require('../../model/projectSchema');
const { isAdmin } = require('../../middleware/priv_check');
const { totalTime } = require('../../misc/time');

router.get('/', async (_, res)=>{
    try {
	const projects = await Project.find({});
	res.json(projects);
    } catch(error) { 
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    } 
});

router.get('/templates/:name', async (req, res)=>{
    try {
        const { name } = req.params;
	const result = await Template.findOne({ name });
        if(result) {
            console.log(result)
            return res.json({"status":"success", result});
        }
        res.json({"status":"failed", "error":"No such process"})
    } catch(error) { 
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    } 
});

router.get('/templates', async (_, res)=>{
    try {
	const templates = await Template.find({});
	res.json(templates);
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/template/create', async (req, res)=>{
    try {
	const { name, process } = req.body;
	console.log(process);

	const time = totalTime(process);
	const template = new Template({ name, time, process });
	await template.save();
	res.json({'status':'success'});
    } catch(error){
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/create', async (req, res)=>{
    try {
	const { name, client, buffer, template, process, priority, resources, } = req.body;
	
	let total_time = totalTime(0, process) * buffer;
	
	let date = Date.now();
	let no_of_hrs = 8;
	let no_of_days = Math.ceil((total_time/(1000*60*60))/no_of_hrs);
	
	let no_of_wd = 6;
	for(let i=0; i < Math.floor(no_of_days/no_of_wd); i++) {
	    date += 7*24*60*60*1000;
	}
	date += (no_of_days % no_of_wd)*(24*60*60*1000);
	
	const project = new Project({name, client, buffer, template, process, priority, deadline: date, resources});
	await project.save();
	res.json({'status':'success'});
    } catch(error){
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/templates/update', async (req, res)=>{
    try {
	const { name, process } = req.body;
	// checks
	await Template.findOneAndUpdate({ name }, { process });
	res.json({'status':'success'});
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
