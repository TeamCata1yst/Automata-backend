const router = require('express').Router()
const { Query } = require('../../model/querySchema')

router.get('/', async (req, res) => {
    try {
        const queries = await Query.find({})
        res.json({'status':'success', 'result': queries})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.post('/resolve', async (req, res) => {
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
