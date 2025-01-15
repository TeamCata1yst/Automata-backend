const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { Admin, Department } = require('../../model/userSchema')
const { Company } = require('../../model/companySchema')
const { isAdmin } = require('../../middleware/priv_check')

router.get('/list', async (req, res) => {
    const a = await Department.find({})
    var l = []
    a.forEach(x => {
        l.push(x.company)
    })
    res.json({'status':'success', 'result': l})
})

router.get('/', isAdmin, async (req, res) => {
    try {
        if(req.session.company_info) {
            var a = await Company.findOne({ comp_name: req.session.company })
            return res.json({'status':'success', 'result': a})
        }
        res.json({'status':'failed'})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

router.post('/edit', isAdmin, async (req, res) => {
    try {
        if(!req.session.company_info) {
            var v = new Company(req.body)
            await v.save()
            await Admin.findOneAndUpdate({ email: req.session.email }, { company: req.body.comp_name})
            var v = new Department({ company: req.body.comp_name })
            await v.save()
            req.session.company = req.body.comp_name
            req.session.company_info = true
        } else {
            await Company.findOneAndUpdate({ comp_name: req.session.company }, req.body)
        }

        var token = jwt.sign(req.session, process.env.SECRET);
        res.json({'status':'success', 'Token': token})
    } catch(error) {
        console.log(error)
        res.status(500).json({'status':'failed', 'error':'internal error'})
    }
})

module.exports = router
