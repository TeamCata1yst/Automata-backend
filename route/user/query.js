const router = require('express').Router()
const { Project } = require('../../model/projectSchema')
const { Query } = require('../../model/querySchema')
const { isUser } = require('../../middleware/priv_check')

router.get('/', isUser, async (req, res) => {
    try {
        const { id } = req.session;
        const val = await Project.find({ resources: id})
        var arr = []
        console.log(val)
        val.forEach((ele, i)=>{
            arr.push(ele.id)
        })
        console.log(arr)
        const queries = await Query.find({ project_id: { "$in": arr }})
        res.json({'status':'success', 'result': queries})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.post('/resolve', isUser, async (req, res) => {
    try {
        const { query_id, remark } = req.body;
        await Query.findOneAndUpdate({id: query_id, status: true, remark})
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

module.exports = router
