const { Client, logger } = require('camunda-external-task-client-js')
const config = { baseUrl: 'http://localhost:8080/engine-rest/', use: logger }
const { settings }  = require('./settings.js')

const get_mail = new Client(config)
get_mail.subscribe('GetMail', async function ({ task, taskService }) {
  var Imap = require('imap'),
    inspect = require('util').inspect

  var imap = new Imap({
    user: settings.user,
    password: settings.password,
    host: settings.host,
    port: 993,
    tls: true
  })

  function openInbox (cb) {
    imap.openBox('INBOX', false, cb)
  }

  imap.once('ready', function () {
    openInbox(function (err, box) {
      if (err) throw err
      // imap.search([ ['HEADER', 'SUBJECT', 'паро'] ], function (err, results) {
      imap.search([ ['BODY', 'уважением'] ], function (err, results) {

        imap.setFlags(results, ['\\Unseen'], function(err) {
          if (!err) {
              console.log("marked as NO read");
          } else {
              console.log(JSON.stringify(err, null, 2));
          }
      });
        var f = imap.fetch(results, { bodies: '' })
        f.once('error', function (err) {
          console.log('Fetch error: ' + err)
        })
        f.once('end', function () {
          console.log('Done fetching all messages!')
          imap.end()
        })
      })
    })
  })

  imap.once('error', function (err) {
    console.log(err)
  })

  imap.once('end', function () {
    console.log('Connection ended')
  })

  imap.connect()

  taskService.complete(task)
})
