const router = require('express').Router();
const { isUser } = require('../../middleware/priv_check'); 
const { Project } = require('../../model/projectSchema');

router.get('/', isUser, (req, res)=>{
    try {
	const projects = Project.find({ 'status': false, users:{id: req.session.user.id} });
	projects.forEach((project, index)=>{
	    return projects[index] = {
		id: project.id,
		process: project.process,
		time: project.time,
		priority: project.priority	 
	    };
	});
	res.status(200).json(projects);
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/task', isUser, (req, res)=>{
    try {
	const { project_id, process_id, subtask_id } = req.body;
	// permission check
	// checks
	if(subtask_id){
	    Project.findOneAndUpdate({ id: project_id, $elemMatch:{ 
		'process.id': process_id,
		'process.user': req.session.user.id,
		'process.subtask.id': subtask_id 
	    }}, { $set: { 
		'process.$[outer].subtask.$[inner].status': true
	    }}, { arrayFilters:[
		{'outer.id': process_id}, {'inner.id': subtask_id}
	    ]});
	} else {
	    Project.findOneAndUpdate({ id: project_id, $elemMatch:{ 
		'process.id': process_id, 
		'process.user': req.session.user.id 
	    }}, { $set: 
		{ 'process.status': true }
	    });
	}    
	res.status(200).json({ 'status':'success' });
    } catch(error) {
	console.log(error);
	res.status(200).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
