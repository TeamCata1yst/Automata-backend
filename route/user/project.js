const router = require('express').Router();
const { isUser } = require('../../middleware/priv_check'); 
const { Project } = require('../../model/projectSchema');
const { Company } = require('../../model/companySchema');

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
         
        //
        const comp = await Company.findOne({comp_name: req.session.company})
        var now_t = arr[0].date

        var init_time = comp.start_time.split(':').map( x => {
            return parseInt(x)
        })

        var hours = [Math.ceil(comp.hours), (comp.hours*10)%10]
        var leaves = comp.weekend

        arr.forEach( elem => {
        if(elem.time_req && elem.time_req != 0) {
            if(now_t != 0) {
                while(leaves.includes(now_t.getDay())) {
                    
                    now_t = new Date(Date.parse(now_t) + 24*60*60*1000)
                }
                if( !( ( now_t.getHours() + now_t.getMinutes()/60 >= init_time[0] + init_time[1]/60 ) && ( now_t.getHours() + now_t.getMinutes()/60 <= (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10) ) )) {
                    if( !( now_t.getHours() + now_t.getMinutes()/60 >= init_time[0] + hours[0] + init_time[1]/60 + hours[1]/10 )) {
                        now_t.setHours(init_time[0], init_time[1])
                        
                    } else {
                        now_t.setHours(init_time[0], init_time[1])
                        now_t = new Date(Date.parse(now_t) + 24*60*60*1000)
                        
                    }
                }
                
                var after_t = new Date(Date.parse(now_t) + elem.time_req)
                elem.init_time = new Date(Date.parse(now_t))

                
                if((after_t.getHours() + after_t.getMinutes()/60 <= (init_time[0] + hours[0]) + (init_time[1]/60 + hours[1]/10) ) && after_t.getDay() == now_t.getDay() && after_t.getDate() == now_t.getDate()) {
                    
                    elem.deadline = new Date(Date.parse(after_t))
                    now_t = after_t
                } else {
                    var out_t = new Date(Date.parse(now_t))
                    out_t.setHours(init_time[0] + hours[0], init_time[1] + (hours[1]/10)*60)

                    
                    var left_over = (elem.time_req - (Date.parse(out_t) - Date.parse(now_t)))/(1000*60*60)
                    if(left_over < 0)
                        left_over = 0
                    
                    while(left_over > (hours[0] + hours[1]/10)) {
                        
                        if(leaves.includes(now_t.getDay())) {
                            now_t = new Date(Date.parse(now_t) + 24*60*60*1000)
                            continue
                        }
                        now_t = new Date(Date.parse(now_t) + 24*60*60*1000)
                        left_over -= (hours[0] + hours[1]/10)
                        
                    }
                    now_t.setHours(init_time[0], init_time[1])
                    
                    
                    now_t = new Date(Date.parse(now_t) + (left_over*60*60*1000) + 24*60*60*1000)
                    elem.deadline = new Date(Date.parse(now_t))
                }
                
            }
        }

        });
        //
        var tasks = [];
        let n = new Date()
        
        n.setHours(parseInt(c[0]), parseInt(c[1]))

        tasks.push({date: n, tasks:[]})
        arr.forEach((task, _) => {
            var val = 0
            console.log(task)
            if(!task.deadline) {
                task.deadline = new Date()
                let t = new Date(task.deadline)
                t.setHours(parseInt(c[0]), parseInt(c[1]))
                tasks.push({ date: t, tasks:[ task ]})
                return 
            }

            for(let i = 0; i < tasks.length; i++) {
                let t = new Date(task.deadline)
                t.setHours(parseInt(c[0]), parseInt(c[1]))

                if(tasks[i].date.getDate() == t.getDate() && tasks[i].date.getMonth() == t.getMonth() && tasks[i].date.getFullYear() == t.getFullYear()) {
                    
                    tasks[i].tasks.push(task)
                    val = 1
                    break
                }
            }
            if(val == 0) {
                let t = new Date(task.deadline)
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
        await Project.findOneAndUpdate({ 
            id: project_id,
            company: req.session.company,
	    process: { $elemMatch: {
                    'task_id': task_id,
                    'selected_resource': req.session.id
                }
            }}, { '$set': {
		'process.$.status': status,
                'process.$.remark': remark
	    }});
	
	res.status(201).json({ 'status':'success' });
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
