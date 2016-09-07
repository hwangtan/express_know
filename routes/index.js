var express             = require('express');
var router              = express.Router();
var messages            = [{nickname:'',message:''}];
var multipart           = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs                  = require('fs');
var path                = require('path')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('header', function(err, head) {
        res.render('index', function(err, about) {
                res.send(head + about);
        });
  });
});

router.get('/st_get', function(req, res) {
    res.render('header', function(err, head) {
        res.render('getPage',
            {lastname: '', firstname: '', check:''},
             function(err, getPage) {
                res.send(head + getPage);
        });
    });
});

router.get('/st_post', function(req, res) {

    res.render('header', function(err, head) {
        res.render('postPage', { messages: messages }, function(err, postPage) {
                res.send(head + postPage);
        });
    });
});

router.get('/st_upload', function(req, res) {

     fs.readdir(__dirname +'/../public/images/', function(err,imgFiles){
        res.render('header', function(err, head) {
            res.render('uploadPage', {imgArray : imgFiles }, function(err, uploadPage) {
                    res.send(head + uploadPage);
            });
        });
    });
});

router.get('/change', function(req, res) {

    var lastname  = req.query.lastname;
    var firstname = req.query['first name']; //subscript notation
    var check     = req.query.checking; //checkbox

     res.render('header', function(err, head) {
        res.render('getPage',
            {lastname: lastname, firstname: firstname, check:check},
             function(err, getPage) {
                res.send(head + getPage);
        });
    });


});

router.post('/reply', function(req, res, next) {
    var nickname = req.body.nickname;
    var message  = req.body.message;
    messages.push({nickname:nickname, message: message});
    res.redirect('/st_post');

});

router.post('/upload', multipartMiddleware, function(req, res) {
    var target_path = __dirname + '/../public/images/'+ req.files.img_file.originalFilename;
    var temp_path   = req.files.img_file.path;
    fs.readFile(temp_path, function(err, data) {
        fs.writeFile(target_path, data, function(err) {
            res.redirect('/st_upload');
        });
    });
});


module.exports = router;
