const ImapClient = require('emailjs-imap-client').default

const getClient = async (user) => {
  const client = new ImapClient("imap.mail.ru", 993, {
    logLevel: 1000,
    auth: {
      user: user.login,
      pass: user.password
    }
  })

  client.onerror = (error) => console.log(error)

  await client.connect()

  return client
}

const getMailboxes = async (user) => await
  (await getClient(user))
    .listMailboxes()

const selectMailbox = async (user, path) => await
  (await getClient(user))
    .selectMailbox(path)

const getMessage = async (user, path, uid) => (await (await getClient(user))
  .listMessages(path, `${uid}`, ['uid', 'flags', 'envelope', 'body[]'], { byUid: true }))[0]

const getMessagesInfo = async (user, path, begin, end) => await
  (await getClient(user))
    .listMessages(path, `${begin}:${end}`, ['uid', 'flags', 'envelope'])

const deleteMessages = async (user, path, sequence) => await
  (await getClient(user)).deleteMessages(path, sequence, { byUid: true })


module.exports = {
  getMailboxes,
  getMessage,
  getMessagesInfo,
  selectMailbox,
  deleteMessages
}