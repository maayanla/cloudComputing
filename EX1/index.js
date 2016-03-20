var express = require('express');
var nodemailer = require('nodemailer'); 
var basicAuth = require('basic-auth');
var multer  = require('multer')

var app = express();

var dstorage = multer.memoryStorage();

var upload = multer({ storage: dstorage,
    filefilter: function (req, file, cb) {
        cb(null, file.mimetyoe == "application/zip")
    } })

// send e-mail via pre-set e-mail account
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'cloud.techbologies.huji@gmail.com',
        pass: 'maayan123'
    }
});

function displayForm(res) {
    fs.readFile('form.html', function(err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}


var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'user' && user.pass === 'pass') {
    return next();
  } else {
    return unauthorized(res);
  };
};



app.get('/', auth, function (req, res) {
  res.send(200, 'Authenticated');
  // displayForm(res);
});

app.post('/upload', upload.any(), function (req, res, next) {
    
  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: '"Cloud Technologies" <cloud.techbologies.huji@gmail.com>', // sender address
      to: req.body.email, // list of receivers
      subject: 'Ex1: File attachment', // Subject line
      html: '<b>File attached.</b>', // html body
      attachments: [
          {   // filename and content type is derived from path
              filename: req.files[0].originalname,
              content: req.files[0].buffer
          }
      ]
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
          return res.json({error: error, status: "Mail not sent."});
      }
      res.json({status: "Mail sent succefully."})
  });
})


app.listen(3000, function() {
});