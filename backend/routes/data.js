var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET users listing. */
router.get('/countries', function (req, res) {
  fs.readFile('./json/land.json', (err, data) => {
    if (err) throw err;
    const d = JSON.parse(data);
    res.send(d);
  });
});
router.get('/cities', function (req, res) {
  fs.readFile('./json/stad.json', (err, data) => {
    if (err) throw err;
    const d = JSON.parse(data);
    res.send(d);
  });
});

router.post('/cities', function (req, res) {
  const data = JSON.stringify(req.body, null, 2);
  console.log(data);
  fs.writeFile('./json/stad.json', data, (err) => {
    if (err) throw err;
  })


  res.send("Stad sparad!");
});

module.exports = router;
