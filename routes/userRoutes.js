const router = require('express').Router();
const { resolvers } = require('../GraphQL.js');

// define the home page route
router.get('/', function (req, res) {
    res.send('Birds home page');
});
// define the about route
router.get('/about', function (req, res) {
    res.send('About birds');
});

router.post("/register", function (req, res) {
    const user = req.query;
    resolvers.createUser({ nick: user.nick, password: user.password });
    res.send(`Register completed.`)
})

module.exports = router;