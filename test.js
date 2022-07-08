const { settings }  = require('./settings.js')

var Imap = require('imap'),
    inspect = require('util').inspect;
 
    var imap = new Imap({
        user: settings.user,
        password: settings.password,
        host: settings.host,
        port: 993,
        tls: true
      })
 
function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}
 
imap.once('ready', function() {
    openInbox(function(err, box) {
        console.log(box.messages);
      });
});
 
imap.connect();
