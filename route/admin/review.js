const router = require('express').Router();
const { Project } = require('../../model/projectSchema');
const { isAdmin } = require('../../middleware/priv_check');

router.post('/', isAdmin, async (req, res) => {
    try {
        const { id, milestone, rating } = req.body;
        await Project.findOneAndUpdate({ company: req.session.company, id,
            milestones: { 
                $elemMatch: {
                    'milestones.$.name': milestone
                }
            }}, { '$set': {
                'milestones.$.rating': rating
            }
            });
        res.status(201).json({'status':'success'});
    } catch(error) {
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }    
})

module.exports = router;
