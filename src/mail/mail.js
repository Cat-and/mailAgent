const simpleParser = require('mailparser').simpleParser

const Imap = require('./imap')
const nodemailer = require("nodemailer")

const sendMail = async (user, letter) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.mail.ru",
    port: 465,
    secure: true,
    auth: {
      user: user.login,
      pass: user.password,
    }
  })

  const sentObject = {
    from: '"' + user.login + '" <' + user.login + '>',
    to: letter.to.toString(),
    subject: letter.subj,
    text: letter.text,
    attachments: letter.attachments,
  }
  
  return await transporter.sendMail(sentObject);
}

const getMailboxes = async (user) => {
  const imapMailboxes = await Imap.getMailboxes(user)
  const mailboxes = imapMailboxes.children.map(mailbox => ({
    name: mailbox.name,
    path: mailbox.path
  }))
  return mailboxes
}

const getMessage = async (user, boxPath, uid) => {
  try {
    const message = await Imap.getMessage(user, boxPath, uid)
    return { info: message.envelope, body: await simpleParser(message['body[]']) }
  } catch (error) {
    return error
  }
}

const getMessagesInfo = async (user, boxPath, rangeBegin, rangeEnd) => {
  try {
    return await Imap.getMessagesInfo(user, boxPath, rangeBegin, rangeEnd)
  } catch (error) {
    return error
  }
}

const getMailboxSize = async (user, path) => (await
  Imap.selectMailbox(user, path)).exists

const deleteMessages = async (user, path, sequence) => await
  Imap.deleteMessages(user, path, sequence)

module.exports = {
  sendMail,
  getMailboxes,
  getMessage,
  getMessagesInfo,
  getMailboxSize,
  deleteMessages
}