const router = require('express').Router();
const { isUser } = require('../../middleware/priv_check'); 
const { Project } = require('../../model/projectSchema');
const { Company } = require('../../model/companySchema');
const { Query } = require('../../model/querySchema');
const { totalTime } = require('../../misc/time');

router.get('/id/:id', isUser, async (req, res) => {
    try {
        const project = await Project.findOne({ id: req.params.id, company: req.session.company });
        let arr = [];
        project.process.forEach( (task, index) => {
            if(task.selected_resource == req.session.id) {
                arr.push(task)
            }
	});
        res.json({'status':'success', result: arr});
    } catch(error) {
        console.log(error);
        res.json({'status':'failed', 'error':'internal error'})
    }     
});

router.get('/', isUser, async (req, res)=>{
    try {
        const { id } = req.session;
        const projects = await Project.find({ resources: id, company: req.session.company });
        const com = await Company.findOne({ comp_name: req.session.company })
        var queries = await Query.find({ resource_id: id, company: req.session.company, $or: [ { status: 2 }, { status: 3 } ]});

        var c = com.start_time.split(':')
        projects.sort((a, b)=> parseInt(a.priority) - parseInt(b.priority))
    
        var arr = [];
        for(let n = 0; n < projects.length; n++) { 
            for(let i = projects[n].process[0].next[0]; i < projects[n].process.length; i++) {
                if(projects[n].process[i].selected_resource == id) {
                    projects[n].process[i].project_name = projects[n].name;
                    projects[n].process[i].project_id = projects[n].id;
                    projects[n].process[i].date = projects[n].date;
                    projects[n].process[i].priority = projects[n].priority;
                    projects[n].process[i].buffer = projects[n].buffer;
                    projects[n].process[i].init_time = projects[n].init_time;
                    arr.push(projects[n].process[i])
                    
                    let qu = queries.filter( x => x.task.before_id == `${projects[n].id}_${projects[n].process[i].task_id}`);
                    
                    if(qu.length > 0) {
                        for(let j = 0; j < qu.length; j++) {
                            delete qu[j].task.before_id;
                            if(qu[j].status == 3) {
                                qu[j].task.status = 1
                            } else {
                                qu[j].task.status = 0
                            }
                            let project_name = await Project.findOne({ id: qu[j].project_id });
                            arr.push({ ...qu[j].task, init_time: qu[j].init_date, query_id: qu[j].id, project_name: project_name.name, project_id: qu[j].project_id, query: true }) 
                        }
                    }
                    queries = queries.filter(x => !qu.includes(x));
                }
            }
        } 
        for(let j = 0; j < queries.length; j++) {
            delete queries[j].task.before_id;
            if(queries[j].status == 3) {
                queries[j].task.status = 1
            } else {
                queries[j].task.status = 0
            }
            let project_name = await Project.findOne({ id: queries[j].project_id });
            arr.push({ ...queries[j].task, init_time: queries[j].init_date, query_id: queries[j].id, project_name: project_name.name, project_id: queries[j].project_id, query: true }) 
        }

        if(arr.length == 0) {
            return res.status(200).json([]);
        }
        const now_t = new Date(Date.parse(arr[0].init_time))
         
        var hours = [Math.floor(com.hours), (com.hours*10)%10]
        var init_time = c.map( x => {
            return parseInt(x)
        })        
        var weekend = com.weekend
        arr.forEach( element => {
                
                if(element.status != 0 && element.status != -1 ) {
                    if(Date.parse(arr[0].init_time) > Date.parse(element.complete_time) ) {
                        return
                    }
                }   
                while(weekend.includes(now_t.getDay())) {
                    now_t.setHours(init_time[0], init_time[1])    
                    now_t.setDate(now_t.getDate() + 1)
                }
                if(now_t.getHours() + now_t.getMinutes()/60 >= init_time[0] + init_time[1]/60 && now_t.getHours() + now_t.getMinutes()/60 < (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10)) {
                    element.init_time = new Date(Date.parse(now_t))
                    var after_t = new Date(Date.parse(now_t) + element.time_req)
                    if((after_t.getHours() + after_t.getMinutes()/60 >= init_time[0] + init_time[1]/60) && (after_t.getHours() + after_t.getMinutes()/60 < (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10)) && now_t.getDate() == after_t.getDate() && now_t.getFullYear() == after_t.getFullYear() && now_t.getMonth() == after_t.getMonth()) {
                        let val = element.time_req/(1000*60*60)
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
                    
                    while(weekend.includes(now_t.getDay())) {
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
                'process.$.remark': remark,
                'process.$.complete_time': new Date()
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
