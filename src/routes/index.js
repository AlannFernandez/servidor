const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {    
    res.status(200).send("Hi from home page");
});


module.exports = router;    