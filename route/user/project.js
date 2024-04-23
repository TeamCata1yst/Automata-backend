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
                    elem.init_time = project.init_time;
                    arr.push(elem)
                }
            });
	});
        
        const now_t = new Date(Date.parse(arr[0].init_time))
         
        var hours = [Math.floor(com.hours), (com.hours*10)%10]
        var init_time = c.map( x => {
            return parseInt(x)
        })        
        var weekend = com.weekend
        arr.forEach( element => {
                console.log(now_t)
                while(weekend.includes(now_t.getDay())) {
                    now_t.setHours(init_time[0], init_time[1])    
                    now_t.setDate(now_t.getDate() + 1)
                }
                console.log(now_t.getHours(), now_t.getDate())
                if(now_t.getHours() + now_t.getMinutes()/60 >= init_time[0] + init_time[1]/60 && now_t.getHours() + now_t.getMinutes()/60 < (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10)) {
                    element.init_time = new Date(Date.parse(now_t))
                    var after_t = new Date(Date.parse(now_t) + element.time_req)
                    if((after_t.getHours() + after_t.getMinutes()/60 >= init_time[0] + init_time[1]/60) && (after_t.getHours() + after_t.getMinutes()/60 < (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10)) && now_t.getDate() == after_t.getDate() && now_t.getFullYear() == after_t.getFullYear() && now_t.getMonth() == after_t.getMonth()) {
                        let val = element.time_req/(1000*60*60)
                        console.log("yes", now_t.getHours(), (after_t.getHours() + after_t.getMinutes()/60), init_time[0], hours[0], (init_time[1]/60 + hours[1]/10))
                        now_t.setHours(now_t.getHours() + Math.floor(val), now_t.getMinutes() + ((val*10)%10)*6) 
                        element.deadline = new Date(Date.parse(now_t))
                    } else {
                        let dis = ((init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10)) - (now_t.getHours() + now_t.getMinutes()/60)
                        var left_over = element.time_req/(1000*60*60) - dis
                        now_t.setHours(init_time[0], init_time[1])
                        now_t.setDate(now_t.getDate() + 1)
                        
                        while(weekend.includes(now_t.getDay())) {
                            now_t.setDate(now_t.getDate() + 1) 
                        }

                        while(left_over > hours[0] + hours[1]/10) {
                            console.log("i")
                            if(weekend.includes(now_t.getDay())) {
                                now_t.setDate(now_t.getDate() + 1) 
                            } else {
                                left_over -= (hours[0] + hours[1]/10)
                                now_t.setDate(now_t.getDate() + 1)
                            }
                        }
                        now_t.setHours(now_t.getHours() + Math.floor(left_over), now_t.getMinutes() + ((left_over*10)%10)*6)
                        element.deadline = new Date(Date.parse(now_t))
                    }
                } else {
                    if(now_t.getHours() + now_t.getMinutes()/60 > (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1])) {
                        now_t.setDate(now_t.getDate() + 1)
                    }
                    now_t.setHours(init_time[0], init_time[1])
                    while(weekend.includes(now_t)) {
                        now_t.setDate(now_t.getDate() + 1)
                    }
                    element.init_time = new Date(Date.parse(now_t))
                    var left_over = element.time_req/(1000*60*60)
                    while(left_over > hours[0] + hours[1]/10) {
                        if(weekend.includes(now_t.getDay())) {
                            now_t.setDate(now_t.getDate() + 1) 
                        } else {
                            left_over -= (hours[0] + hours[1]/10)
                            now_t.setDate(now_t.getDate() + 1)
                        }
                    }
                    now_t.setHours(now_t.getHours() + Math.floor(left_over), now_t.getMinutes() + ((left_over*10)%10)*6)
                    element.deadline = new Date(Date.parse(now_t))
                }
                console.log(now_t.getHours(), now_t.getDate())
            
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
