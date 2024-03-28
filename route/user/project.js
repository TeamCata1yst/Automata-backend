const router = require('express').Router();
const { isUser } = require('../../middleware/priv_check'); 
const { Project } = require('../../model/projectSchema');


// LOGICAL ERRORRRRRRR
router.get('/', isUser, async (req, res)=>{
    try {
        const { id } = req.session;    //Only for testing, to be changed with req.session.user.id, also convert it to GET req after session is implemented
	const projects = await Project.find({ resources: id });
        projects.sort((a, b)=> parseInt(a.priority) - parseInt(b.priority))
    
        const arr = [];
        projects.forEach( (project, index) => {
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
        
        var tasks = [];
        
        arr.forEach((task, _) => {
            var val = 0
            for(let i = 0; i < tasks.length; i++) {
                let t = task.deadline
                t.setHours(9)

                if(tasks[i].date == t) {
                    tasks[i].tasks.push(task)
                    val = 1
                    break
                }
            }
            if(val == 0) {
                let t = task.deadline
                t.setHours(9)
                tasks.push({ date: t, tasks:[ task ]})
            }
        });

        res.status(200).json(tasks);
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/task', isUser, async (req, res)=>{
    try {
	const { project_id, task_id } = req.body;
        await Project.findOneAndUpdate({ 
            id: project_id, 
	    process: { $elemMatch: {
                    'task_id': task_id,
                    'selected_resource': req.session.id
                }
            }}, { '$set': {
		'process.$.status': req.body.status
	    }});
	
	res.status(201).json({ 'status':'success' });
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
