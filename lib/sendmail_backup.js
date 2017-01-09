var nodemailer = require('nodemailer');
var fs = require('fs');

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "gmail",
    auth: {
        user: "dqinfa",
        pass: "dqinfa@1"
    }
});

fs.readFile('qatrack.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  if(data.indexOf("<a") > -1){
   var arr = data.toString().split("\"");
   QATrackGeneratedLink=arr[1];
   var url ="http://psrlxpamqa1:8080";
   var QATrack =  url.concat(QATrackGeneratedLink);
    var mailOptions = {
    from: '"no-reply@informatica.com" <dqinfa@gmail.com>', // sender address
    to: 'asarkar@informatica.com',
    cc: 'asarkar@informatica.com',	// list of receivers
    subject: 'CLI Automation report', // Subject line
    html:  "QA Track URL : " +QATrack,
	
     };
      smtpTransport.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
     });
  }
});



