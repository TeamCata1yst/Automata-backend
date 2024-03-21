const router = require('express').Router();
const { Query } = require('../../model/querySchema');
const { Project } = require('../../model/projectSchema');

router.post('/projects', async (req, res) =>{
    try {
        const { client } = req.body;
        const project = await Project.fine({ client });
        res.json({ 'status': 'success', 'result': project })
    } catch(error) {
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.post('/queries', async (req, res) =>{
    try {
        const { client } = req.body;
        const result = await Query.find({ client });
        res.json({'status':'success', result}) 
    } catch(err) {
        console.log(err)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
});

router.post('/queries/add', async (req, res) =>{
    try {
        const {project_id, client_id, query} = req.body;
        const project = new Query({ project_id, client_id, query })
        await project.save()
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

module.exports = router
