var express = require('express');
var router = express.Router();
var messages = [{nick:'',message:''}];
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var path = require('path')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { last: '', first: '', check:'', messages: messages });
});

router.get('/change', function(req, res) {

    console.log(req.body,req.query);

    var lastname = req.query.lastname;
    var firstname = req.query['first name']; //subscript notation
    var check = req.query.checking; //checkbox

    res.render('index', {
             last: lastname,
            first: firstname,
            check: check,
            messages: messages
        });
});

router.post('/signup', multipartMiddleware, function(req, res, next) {
    var nickname = req.body.nickname;
    var message  = req.body.message;
    messages.push({nick:nickname, message: message});
    console.log(process.argv[1]);
    console.log(__dirname)
    /*req.files.image in objects
        fieldName, originalFilename, path, headers, size, name, type
    */
    /*^ extra slash*/
    var target_path = __dirname + '/../public/images/'+ req.files.image.originalFilename;
    var temp_path   = req.files.image.path;
    fs.readFile(temp_path, function(err, data) {
        fs.writeFile(target_path, data, function(err) {
            res.redirect('/');
        });
    });

});


module.exports = router;
