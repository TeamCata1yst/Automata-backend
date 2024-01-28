const router = require('express').Router();
const { Query } = require('../../model/querySchema');

router.get('/', async (req, res) =>{
    try {
        const result = await Query.find({});
        res.json({'status':'success', result}) 
    } catch(err) {
        console.log(err)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
});

module.exports = router
