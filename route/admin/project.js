const router = require('express').Router();
const { Project, Template } = require('../../model/projectSchema');
const { Client } = require('../../model/userSchema');
const { Company } = require('../../model/companySchema')
const { isAdmin } = require('../../middleware/priv_check');
const { totalTime } = require('../../misc/time');

router.get('/', isAdmin, async (req, res)=>{
    try {
	const projects = await Project.find({ company: req.session.company });
	    let n = []
            projects.forEach( (e, i) => {
            var mil = {}
            e.process.filter( x => x.milestone ).forEach( elem => {
                if(!mil[elem.milestone_tag]) {
                    mil[elem.milestone_tag] = []    
                }

                mil[elem.milestone_tag].push({ time_req: elem.time_req, status: elem.status })
            })
            Object.entries(mil).forEach( (elem, index) => {
                var v = elem[1].reduce((n, {time_req}) => n + time_req, 0)
                elem[1].forEach( (x, j) => {
                    elem[1][j].percentage = (x.time_req/v) * 100
                })
                mil[elem[0]] = elem[1]
            })

            console.log(mil)
            n.push({ ...projects[i]._doc })
            n[i].milestones = Object.entries(mil).map(x => {
                return { name: x[0], tasks: x[1] }
            })
        })

        res.json(n);
    } catch(error) { 
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    } 
});

router.get('/id/:id', isAdmin, async (req, res)=>{
    try {
        const { id } = req.params;
	const result = await Project.findOne({ id, company: req.session.company });
        const client = await Client.findOne({id: result.client_id})
        if(result) {
            return res.json({"status":"success", result, client});
        }
        res.json({"status":"failed", "error":"No such process"})
    } catch(error) { 
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    } 
});

router.get('/templates/:id', isAdmin, async (req, res)=>{
    try {
        const { id } = req.params;
	const result = await Template.findOne({ _id: id, company: req.session.company });
        if(result) {
            return res.json({"status":"success", result});
        }
        res.json({"status":"failed", "error":"No such process"})
    } catch(error) { 
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    } 
});

router.get('/templates', isAdmin, async (req, res)=>{
    try {
	const templates = await Template.find({ company: req.session.company });
	res.json(templates);
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/template/copy', isAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        const val = await Template.findOne({ _id: id, company: req.session.company })
        if(val) {
            const template = new Template({ name: val.name + " (copy)", process: val.process, time: val.time, milestones: val.milestones, company: req.session.company })
            await template.save()
        }
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'success'});
    }
})
router.post('/template/create', isAdmin, async (req, res)=>{
    try {
	const { name, process, milestones } = req.body;
        console.log(req.body)
	const { t } = totalTime(0, 0, 0, 0, [], process);
	const template = new Template({ name, process, time: t, milestones, company: req.session.company });
	await template.save();
	res.json({'status':'success'});
    } catch(error){
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/template/delete', isAdmin, async (req, res)=>{
    try {
	const { id } = req.body;

	await Template.findOneAndDelete({ _id: id, company: req.session.company });
	res.json({'status':'success'});
    } catch(error){
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/create', isAdmin, async (req, res)=>{
    try {
	var { name, client, email, mobile_no, buffer, template, process, resources, city } = req.body;
        var comp = await Company.findOne({ comp_name: req.session.company})

        var h = [Math.floor(comp.hours), (comp.hours*10)%10]
        var init_time = comp.start_time.split(':').map( x => {
            return parseInt(x)
        })

        process.forEach((_, index) => {
            process[index].remark = ""
            process[index].status = 0
        })

	var { t, process} = totalTime(0, new Date(), init_time, h, comp.weekend, process);
	let total_time = t * buffer;
	let date = Date.now();
	let no_of_hrs = comp.hours;
	let no_of_days = Math.ceil((total_time/(1000*60*60))/no_of_hrs);
	
	let no_of_wd = comp.weekend;
        
	for(let i=0; i < no_of_days; i++) {
	    date += 24*60*60*1000;
            if(no_of_wd.includes(new Date(date).getDay())) {
                date += 24*60*60*1000;
            }
	} 
        
        var val = await Client.findOne({ company: req.session.company, $or: [{ email }, { mobile_no }] })
        if(val) {
            await Project.updateMany({ client: val.name, company: req.session.company }, { client } )
            await Client.findOneAndUpdate({ company: req.session.company, $or: [{ email }, { mobile_no }] }, { email, mobile_no, name: client })
        } else {
            val = new Client({ email, mobile_no, name: client, company: req.session.company })
            await val.save()
        }
        
        const priority = await Project.countDocuments();
	const project = new Project({name, client, client_id: val.id, buffer, template, city, process, priority, deadline: date, resources, remaining_time: t, company: req.session.company, init_time: new Date() });
	await project.save();
        
        res.json({'status':'success'});
    } catch(error){
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/delete', isAdmin, async (req, res)=>{
    try {
        const { id } = req.body;
        const val = await Project.findOneAndDelete({ id, company: req.session.company });
        await Project.updateMany({ company: req.session.company, priority:{ $gt: val.priority} }, { $inc: { priority: -1}});
        if(val.priority == 0) {
            Project.findOneAndUpdate({ company: req.session.company, priority: 0 }, { init_time: new Date()});
        }
        res.json({'status':'success'});
    } catch(error) {
        res.status(500).json({"status":"failed", "error":"internal error"});
        console.log(error)
    }
});

router.post('/update', isAdmin, async (req, res)=>{
    try {
	const { id, name, resources, process, client, email, mobile_no, buffer, city  } = req.body;
        var val = await Client.findOne({ company: req.session.company, $or: [{ email }, { mobile_no }] })
        if(val) {
            await Project.updateMany({ client: val.name, company: req.session.company }, { client } )
            await Client.findOneAndUpdate({ company: req.session.company, $or: [{ email }, { mobile_no }] }, { email, mobile_no, name: client })
        } else {
            val = new Client({ email, mobile_no, name: client, company: req.session.company })
            await val.save()
        }	
        if(buffer) {
            var comp = await Company.findOne({ comp_name: req.session.company})
            var proj = await Project.findOne({ id });

	    //var { t } = totalTime(0, 0, 0, 0, [], process);
	    let total_time = proj.remaining_time * buffer;
            console.log(total_time);
	    let date = Date.parse(proj.init_time);
	    let no_of_hrs = comp.hours;
	    let no_of_days = Math.ceil((total_time/(1000*60*60))/no_of_hrs);
	
	    let no_of_wd = comp.weekend;
        
	    for(let i=0; i < no_of_days; i++) {
	        date += 24*60*60*1000;
                if(no_of_wd.includes(new Date(date).getDay())) {
                    date += 24*60*60*1000;
                    console.log("wdwdwdw")
                }
	    }
            console.log(date)
            await Project.findOneAndUpdate({ id, company: req.session.company }, { name, resources, process, client, client_id: val.id, email, mobile_no, buffer, city, deadline: date  });
        } else {
            await Project.findOneAndUpdate({ id, company: req.session.company }, { name, resources, process, client, client_id: val.id, email, mobile_no, city, });
        }
        res.json({'status':'success'});
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/template/update', isAdmin, async (req, res)=>{
    try {
	const { id, name, process, milestones } = req.body;
	// checks
        const { t } = totalTime(0, 0, 0, 0, [], process);
	await Template.findOneAndUpdate({ _id: id, company: req.session.company }, { name, process, milestones, time: t  });
	res.json({'status':'success'});
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.post('/priority', isAdmin, async (req, res) => {
    try {
        const { id, priority, inc} = req.body;
            
        if(inc) {
            await Project.findOneAndUpdate({ priority: priority+1, company: req.session.company}, { priority });
            await Project.findOneAndUpdate({ id, company: req.session.company }, { priority: priority+1, init_time: new Date() });
        } else {
            await Project.findOneAndUpdate({ priority: priority-1, company: req.session.company}, {priority: priority});
            await Project.findOneAndUpdate({ id, company: req.session.company }, { priority: priority-1, init_time: new Date() });
        }

        res.json({'status':'success'});
    } catch(error) {
        console.log(error);
        res.status(500).json({});
    }
});

module.exports = router;
