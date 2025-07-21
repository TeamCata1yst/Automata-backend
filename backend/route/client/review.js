const router = require('express').Router();
const { Project } = require('../../model/projectSchema');
const { isClient } = require('../../middleware/priv_check');

router.post('/', isClient, async (req, res) => {
    try {
        const { id, milestone, rating } = req.body;
        let a = await Project.findOneAndUpdate({ company: req.session.company, client_id: req.session.id, id,
            milestones: { 
                $elemMatch: {
                    'name': milestone
                }
            }}, { '$set': {
                'milestones.$.client_satisfaction': rating
            }
            });
        res.status(201).json({'status':'success'});
    } catch(error) {
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }    
})

module.exports = router;
