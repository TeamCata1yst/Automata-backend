const router = require('express').Router()
const { Project } = require('../../model/projectSchema')
const { Query } = require('../../model/querySchema')
const { User } = require('../../model/userSchema')
const { isUser } = require('../../middleware/priv_check')

router.get('/users', isUser, async (req, res) => {
    try {
	const users = await User.find({ company: req.session.company });
	return res.status(200).json({'status':'success', 'result': users});
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

router.get('/', isUser, async (req, res) => {
    try {
        const { id, company } = req.session;
        const queries = await Query.find({ company, resource_id: id })
        var result = []
        const projects = await Project.find({ company });
        queries.forEach( (val) => {
            const pro = projects.find( (x) => x.id == val.project_id);
            result.push({ ...val['_doc'], project_name: pro.name });
        })
        console.log(result);
        res.json({'status':'success', 'result': result})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.get('/:id', isUser, async (req, res)=> {
    try {
        const { id } = req.params;
        const val = await Query.findOne({ id, company: req.session.company, resource_id: req.session.id })
        if(val) {
            const project = await Project.findOne({id: val.project_id})
            return res.json({'status':'success', 'result': { ...val['_doc'], project_name: project.name }})
        }
        res.json({'status':'failed', 'error':'no such query exists'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.post('/transfer', isUser, async (req, res) => {
    try {
        const { query_id, resource_id } = req.body;
        await Query.findOneAndUpdate({ id: query_id, company: req.session.company, resource_id: req.session.id }, { resource_id }); 
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.post('/task', isUser, async (req, res) => {
    try {
        const { query_id, task } = req.body;
        task.init_time = new Date();
        await Query.findOneAndUpdate({id: query_id, company: req.session.company, resource_id: req.session.id }, { task, status: 2 });
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.post('/task/resolve', isUser, async (req, res) => {
    try {
        const { query_id, status } = req.body;
        if(status == 1) {
            await Query.findOneAndUpdate({id: query_id, company: req.session.company, resource_id: req.session.id }, { $set: {'task.status': status}, status: 3, resolve_date: Date.now() });
        } else {
            await Query.findOneAndUpdate({id: query_id, company: req.session.company, resource_id: req.session.id }, { $set: {'task.status': status} });
        }
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.post('/resolve', isUser, async (req, res) => {
    try {
        const { query_id, remark } = req.body;
        await Query.findOneAndUpdate({id: query_id, company: req.session.company, resource_id: req.session.id }, { status: 1, remark, resolve_date: Date.now() })
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

module.exports = router
