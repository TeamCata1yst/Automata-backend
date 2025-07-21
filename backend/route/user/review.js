const router = require('express').Router();
const { Project } = require('../../model/projectSchema');
const { isUser } = require('../../middleware/priv_check');

router.get('/', isUser, async (req, res) => {
    try {
        let a = await Project.find({ company: req.session.company, resources: req.session.id });
        console.log(a);
        let i = 0;
        let j = 0;
        let total_rating = 0;
        let total_cs = 0;
        a.forEach( y => {
            console.log(y);
            y.milestones.forEach( x => {
                console.log(x);
                if(x.rating != -1) {
                    if(y.process.find( k => k.milestone_tag == x.name && k.selected_resource == req.session.id )) {
                        total_rating += x.rating;
                        i += 1;
                    }
                }
                if(x.client_satisfaction && x.client_satisfaction != -1) {
                    if(y.process.find( k => k.milestone_tag == x.name && k.selected_resource == req.session.id )) {
                        total_cs += x.client_satisfaction;
                        j += 1;
                    }
                }
            })
        });
        console.log(total_rating, total_cs);
        if(total_rating != 0)
            total_rating /= i
        if(total_cs != 0)
            total_cs /= i

        console.log(i, j)
        res.status(201).json({'status':'success', "client_satisfaction": total_cs, "rating": total_rating});
    } catch(error) {
        console.log(error);
        res.status(500).json({'status':'failed', 'error':'internal error'});
    }    
})

module.exports = router;
