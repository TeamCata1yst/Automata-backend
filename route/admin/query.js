const express = require('express');
const router = express.Router();
const { Query } = require('../../model/querySchema');
const { isAdmin } = require('../../middleware/priv_check');

router.get('/:id', isAdmin, async (req, res) => {
    try {
        let queries = await Query.find({ company: req.session.company, project_id: req.params.id });
        res.json({ 'status':'success', 'result': queries })
    } catch(error) {
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    } 
});

router.post('/add', isAdmin, async (req, res) => {
    try {
        const { project_id, subject, resource_id, description } = req.body;
        const project = new Query({ company: req.session.company, project_id, resource_id, subject, description, by_admin: true })
        await project.save()
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
});


router.post('/delete', isAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        await Query.findOneAndDelete({ company: req.session.company, id });
        res.json({'status':'success'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

module.exports = router;
