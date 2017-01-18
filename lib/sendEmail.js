var email = require('emailjs');

exports = module.exports = SendEmail;

function SendEmail(logger, config) {
  this.logger = logger;
  this.config = config;
  this.server = email.server.connect({
    host: config.emailHost//"smtp3.hpe.com"
  });
}

SendEmail.prototype.sendMail = function(data, cb) {
  // send the message and get a callback with an error or details of the message that was sent
  this.server.send({
    from: this.config.email_from,
    to: this.config.email_to,
    cc: this.config.email_cc,
    subject: data.subject,
    attachment:[
	  { data: data.text, alternative:true}
	]
  }, function(err, message) {
    if (err) {
      this.logger.error({err: err}, 'Error Sending Mail');
    }
    cb(err, message);
  }.bind(this));
}

SendEmail.prototype.composeMail = function(resp) {
  var data = {};
  if (resp && resp.indexOf("<a") > -1){
	// TODO - change to regex
	var data_split = data.split("<a href=\\\"");
	data_split = data_split[1].split("\\\">");
	console.log("data_split 0: " +data_split[0]);
    var QATrack =  this.config.qaHomeUrl + data_split[0];
    console.log("QATrack : " +QATrack);
	data.subject = "CLI Automation report - Build Success";
    data.text = "<p>Hi,</p><p>&nbsp;</p><p>&nbsp; &nbsp;Please find&nbsp;QATrack Link for CLI Automation Triggered:</p><p>&nbsp; &nbsp; "+ QATrack +"</p><p>&nbsp;</p><p>Regards,</p><p>CLI&nbsp;Automation Team</p>";
  } else {
     data.subject = "CLI Automation report - Build Failure";
     data.text = "<p>Hi,</p><p>&nbsp;</p><p>&nbsp; &nbsp;The Build failed, Please check logs for more info.<p>&nbsp;</p><p>Regards,</p><p>CLI&nbsp;Automation Team</p>";
  }
  return data;
}