const router = require('express').Router();
const { User } = require('../../model/userSchema');
const { isClient } = require('../../middleware/priv_check');

router.get('/', isClient, async (req, res) => {
    try {
	const users = await User.find({ company: req.session.company });
	return res.status(200).json({'status':'success', 'result': users});
    } catch(error) {
	console.log(error);
	res.status(500).json({'status':'failed', 'error':'internal error'});
    }
});

module.exports = router;
