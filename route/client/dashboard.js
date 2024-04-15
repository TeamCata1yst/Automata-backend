const router = require('express').Router();
const { Query } = require('../../model/querySchema');
const { Project } = require('../../model/projectSchema');
const { isClient } = require('../../middleware/priv_check');

router.get('/projects', isClient, async (req, res) =>{
    try {
        const { id, company } = req.session;
        var n = []
        const project = await Project.find({ client_id: id, company });
        project.forEach( (e, i) => {
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
            n.push({ ...project[i]._doc })
            n[i].milestones = Object.entries(mil).map(x => {
                return { name: x[0], tasks: x[1] }
            })
        })
        console.log(n)
        res.json({ 'status': 'success', 'result': n })
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
