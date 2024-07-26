const router = require('express').Router()
const { Project } = require('../../model/projectSchema')
const { Query } = require('../../model/querySchema')
const { isUser } = require('../../middleware/priv_check')

router.get('/', isUser, async (req, res) => {
    try {
        const { id, company } = req.session;
        const val = await Project.find({ resources: id, company })
        var arr = []
        val.forEach((ele, i)=>{
            arr.push(ele.id)
        })
        const queries = await Query.find({ company, project_id: { "$in": arr }})
        res.json({'status':'success', 'result': queries})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.get('/:id', isUser, async (req, res)=> {
    try {
        const { id } = req.params;
        const val = await Query.findOne({ id, company: req.session.company })
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

router.post('/resolve', isUser, async (req, res) => {
    try {
        const { query_id, remark } = req.body;
        await Query.findOneAndUpdate({id: query_id, company: req.session.company }, { status: true, remark})
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

module.exports = router
