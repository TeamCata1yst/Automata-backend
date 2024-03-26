const router = require('express').Router();
const { Query } = require('../../model/querySchema');
const { Project } = require('../../model/projectSchema');
const { isClient } = require('../../middleware/priv_check');

router.get('/projects', isClient, async (req, res) =>{
    try {
        const { id } = req.session;
        
        const project = await Project.find({ client_id: id });
        res.json({ 'status': 'success', 'result': project })
    } catch(error) {
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.get('/queries', isClient, async (req, res) =>{
    try {
        const { id } = req.session;
        const result = await Query.find({ client_id: id });
        res.json({'status':'success', result}) 
    } catch(err) {
        console.log(err)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
});

router.post('/queries/add', isClient, async (req, res) =>{
    try {
        const {project_id, client_id, subject, description} = req.body;
        const project = new Query({ project_id, client_id, subject, description })
        await project.save()
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

module.exports = router
