const router = require('express').Router();
const { isUser } = require('../../middleware/priv_check'); 
const { Project } = require('../../model/projectSchema');
const { Company } = require('../../model/companySchema');
const { totalTime } = require('../../misc/time')

router.get('/', isUser, async (req, res)=>{
    try {
        const { id } = req.session;    //Only for testing, to be changed with req.session.user.id, also convert it to GET req after session is implemented
	const projects = await Project.find({ resources: id, company: req.session.company });
        const com = await Company.findOne({ comp_name: req.session.company })
        
        var c = com.start_time.split(':')
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
        let n = new Date()
        
        n.setHours(parseInt(c[0]), parseInt(c[1]))

        tasks.push({date: n, tasks:[]})
        arr.forEach((task, _) => {
            var val = 0

            for(let i = 0; i < tasks.length; i++) {
                let t = new Date(task.init_time)
                t.setHours(parseInt(c[0]), parseInt(c[1]))

                if(tasks[i].date.getDate() == t.getDate() && tasks[i].date.getMonth() == t.getMonth() && tasks[i].date.getFullYear() == t.getFullYear()) {
                    
                    tasks[i].tasks.push(task)
                    val = 1
                    break
                }
            }
            if(val == 0) {
                let t = new Date(task.init_time)
                t.setHours(parseInt(c[0]), parseInt(c[1]))
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
	const { project_id, task_id, status, remark } = req.body;
        const a = await Project.findOneAndUpdate({ 
            id: project_id,
            company: req.session.company,
	    process: { $elemMatch: {
                    'task_id': task_id,
                    'selected_resource': req.session.id
                }
            }}, { '$set': {
		'process.$.status': status,
                'process.$.remark': remark
	    }}, {
                'new': true
            });
     
	const { t } = totalTime(0, 0, 0, 0, [], a.process)
        
        await Project.findOneAndUpdate({ id: project_id, company: req.session.company }, { remaining_time: t })
	res.status(201).json({ 'status':'success' });
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
