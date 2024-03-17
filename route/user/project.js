const router = require('express').Router();
const { isUser } = require('../../middleware/priv_check'); 
const { Project } = require('../../model/projectSchema');

router.post('/', /*isUser,*/ async (req, res)=>{
    try {
        const { id } = req.body;    //Only for testing, to be changed with req.session.user.id, also convert it to GET req after session is implemented
	const projects = await Project.find({ resources: id });
        projects.sort((a, b)=> parseInt(a.priority) - parseInt(b.priority))
    
        const arr = [];
        projects.forEach( (project, index) => {
            project.process.forEach( (elem, _) => {
                if(elem.selected_resource == id) {
                    elem.project_name = project.name;
                    elem.project_id = project.id
                    elem.date = project.date;
                    elem.priority = project.priority;

                    arr.push(elem)
                }
            });
	});
    
        var time = new Date(arr[0].date);
        var temp = [];
        var tasks = [];

        arr.forEach((task, _) => {
            let now_d = time.getDay();
            let now_h = time.getHours();
            console.log(now_d, now_h, time) 
            if(now_h > 19) {
                if(now_d == 6) {
                    time.setHours(9)

                    tasks.push({ date: new Date(time), tasks: [...temp]})
                    temp = []

                    time.setDate(time.getDate() + 2)
                    
                    temp.push(task)
                } else {
                    time.setHours(9)
                    tasks.push({ date: new Date(time), tasks: [...temp]})
                    temp = []

                    time.setDate(time.getDate() + 1)
                     
                    temp.push(task)
                }
            } else {
                if(new Date(time + task.time_req).getHours() < 19 && now_d != 0) { 
                    console.log(time)
                    let val = new Date(task.time_req)
                    
                    time.setHours(time.getHours() + val.getHours())
                    time.setMinutes(time.getMinutes() + val.getMinutes())
                    console.log(time)
                    temp.push(task)
                } else {
                    if(now_d == 6) {
                        time.setHours(9)

                        tasks.push({ date: new Date(time), tasks: [...temp]})
                        temp = []

                        time.setDate(time.getDate() + 2) 
                           
                        temp.push(task)
                    } else {
                        time.setHours(9)

                        tasks.push({ date: new Date(time), tasks: [...temp]})
                        temp = []

                        time.setDate(time.getDate() + 1)
                        
                        temp.push(task)
                    }
                } 
            }
            console.log(temp, time)
        });
        time.setHours(9)  
        tasks.push({ date: new Date(time), tasks: [...temp]})
	res.status(200).json(tasks);
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/task', async (req, res)=>{
    try {
	const { project_id, task_id, user_id } = req.body;
        console.log(req.body)
	const a = await Project.findOneAndUpdate({ 
            id: project_id, 
	    process: { $elemMatch: {
                    'task_id': task_id,
                    'selected_resource': user_id
                }
            }}, { '$set': {
		'process.$.status': req.body.status
	    }});
	
        console.log(a, task_id)
	res.status(200).json({ 'status':'success' });
    } catch(error) {
	console.log(error);
	res.status(200).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
