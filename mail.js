const axios = require('axios')
const { Client, logger } = require('camunda-external-task-client-js')
const config = { baseUrl: 'http://localhost:8080/engine-rest/', use: logger }
const { Variables } = require('camunda-external-task-client-js')
const { settings } = require('./settings.js')
var fs = require('fs'),
  fileStream
const get_mail = new Client(config)
get_mail.subscribe('GetMail', async function ({ task, taskService }) {
  var Imap = require('imap'),
    inspect = require('util').inspect

  var imap = new Imap({
    user: 'username',
    password: 'password',
    host: 'imap.yandex.ru',
    port: 993,
    tls: true
  })

  function openInbox (cb) {
    imap.openBox('INBOX', true, cb)
  }

  imap.once('ready', function () {
    openInbox(function (err, box) {
      if (err) throw err
      imap.search(['SEEN', ['SINCE', 'May 20, 2010']], function (err, results) {
        if (err) throw err
        var f = imap.fetch(results, { bodies: '' })
        f.on('message', function (msg, seqno) {
          console.log('Message #%d', seqno)
          var prefix = '(#' + seqno + ') '
          msg.on('body', function (stream, info) {
            console.log(prefix + 'Body')
            stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'))
          })
          msg.once('attributes', function (attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8))
          })
          msg.once('end', function () {
            console.log(prefix + 'Finished')
          })
        })
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
