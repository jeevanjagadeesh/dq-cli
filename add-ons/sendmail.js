var nodemailer = require('nodemailer');
var fs = require('fs');
var smtpTransport = require('nodemailer-smtp-transport');

var logContainingQATrackURL = "dq_cli.log";

var options = {
service: "gmail",
    auth: {
        user: "dqinfa",
        pass: "dqinfa@1"
    }

};

var transporter  = nodemailer.createTransport(smtpTransport(options))

fs.readFile(logContainingQATrackURL, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  if(data.indexOf("<a") > -1){
  var data_split = data.split("<a href=\\\"");
  data_split = data_split[1].split("\\\">");
  console.log("data_split 0: " +data_split[0]);
   QATrackGeneratedLink=data_split[0];
   var url ="http://psrlxpamqa1:8080";
   var QATrack =  url.concat(QATrackGeneratedLink);
   console.log("QATrack : " +QATrack);
    var mailOptions = {
    from: '"no-reply@informatica.com" <dqinfa@gmail.com>', // sender address
    to: 'rajesh@informatica.com',
    cc: 'rajesh@informatica.com',	// list of receivers
    subject: 'CLI Automation report', // Subject line
    //html:  "QA Track URL : " +QATrack,
	html: "<p>Hi,</p><p>&nbsp;</p><p>&nbsp; &nbsp;Please find&nbsp;QATrack Link for CLI Automation Triggered:</p><p>&nbsp; &nbsp; "+QATrack+"</p><p>&nbsp;</p><p>Regards,</p><p>CLI&nbsp;Automation Team</p>",
     };
      // Send email
  transporter.sendMail(mailOptions, function(error, response){
      if(error){
          console.log(error);
      }else{
         // console.log("Message sent: " + response.message);
		  console.log("Message sent successfully ");
      }
  });  
  }
});