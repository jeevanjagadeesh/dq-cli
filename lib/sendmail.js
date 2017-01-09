var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var fs = require('fs');
var match = require('match');

var options = {
service: "gmail",
    auth: {
        user: "dqinfa",
        pass: "dqinfa@1"
    }

};

var transporter  = nodemailer.createTransport(smtpTransport(options))



var mailOptions = {
    from: '"no-reply@informatica.com" <dqinfa@gmail.com>', // sender address
    to: 'rajesh@informatica.com',
    cc: 'rajesh@informatica.com',	// list of receivers
    subject: 'CLI Automation report', // Subject line
    html:  "QA Track URL : " + readLogFile('dq_cli.log'),
};
  
// verify connection configuration
transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});



// Send email
  transporter.sendMail(mailOptions, function(error, response){
      if(error){
          console.log(error);
      }else{
          console.log("Message sent: " + response.message);
      }
  });  
  
function readLogFile(fileName) {
console.log("Parsing Log file!");

fs.readFile(fileName, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  if(data.indexOf("<a") > -1){ 
   var arr = data.toString().split("\"");
   QATrackGeneratedLink=arr[1];
   console.log("QATrackGeneratedLink Parsed 1: " + QATrackGeneratedLink);
   var url ="http://psrlxpamqa1:8080";
   console.log("QA Track Parsed 2: " + url.concat(QATrackGeneratedLink));   
   return  url.concat(QATrackGeneratedLink)
  }
});
}

