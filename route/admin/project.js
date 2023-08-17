const router = require('express').Router();
const { Project, Template } = require('../../model/projectSchema');
const { isAdmin } = require('../../middleware/priv_check');

const totalTime = (process) => {
    var time = 0;
    process.forEach( task => {
	if(task.subtaskReq) {
	    time += totalTime(task.subtasks);
	} else {
	    time += task.time_req;
	}
    });
    return time;
}

router.get('/', async (_, res)=>{
    try {
	const projects = await Project.find({});
	res.json(projects);
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
	const { project_details } = req.body;
	// checks
	const project = new Project(project_details);
	await project.save();
	res.json({'status':'success'});
    } catch(error){
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/update', async (req, res)=>{
    try {
	const { id, process} = req.body;
	// checks
	await Project.findOneAndUpdate({ id }, { process });
	res.json({'status':'success'});
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
