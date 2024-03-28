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
    
        var time = new Date(arr[0].date);
        var temp = [];
        var tasks = [];

        arr.forEach((task, _) => {
            console.log(time.getDate(), new Date(task.date).getDate())
            if(time.getDate() < new Date(task.date).getDate()) {
                 time = task.date
            }
            let now_d = time.getDay();
            
            if(now_d == 0) {
                time.setHours(9)
                time.setDate(time.getDate() + 1)
            } else {
                let a = new Date(time + task.time_req).getHours() 
                if(a <= 19 && a >= 9) { 
                    console.log(time)
                    let val = new Date(task.time_req)
                    
                    time.setHours(time.getHours() + val.getHours())
                    time.setMinutes(time.getMinutes() + val.getMinutes())
                    
                    temp.push(task)
                } else { 
                    
                    time.setHours(9)
                    tasks.push({ date: new Date(time), tasks: [...temp]})
                    temp = []

                    temp.push(task)
                    if(!(a < 9 && a >= 0))
                        time.setDate(time.getDate() + 1) 
                   
                }
            }
        });
        time.setHours(9)  
        tasks.push({ date: new Date(time), tasks: [...temp]})
	console.log(tasks)
        res.status(200).json(tasks);
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/task', isUser, async (req, res)=>{
    try {
	const { project_id, task_id, user_id } = req.body;
        console.log(req.body, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
	console.log(req.session)
        const a = await Project.findOneAndUpdate({ 
            id: project_id, 
	    process: { $elemMatch: {
                    'task_id': task_id,
                    'selected_resource': user_id
                }
            }}, { '$set': {
		'process.$.status': req.body.status
	    }});
	
        console.log(a) 
	res.status(201).json({ 'status':'success' });
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
