const ImapClient = require('emailjs-imap-client').default;
const parse = require('emailjs-mime-parser').default;
const {
  encode, decode, convert,
  mimeEncode, mimeDecode,
  base64Encode, base64Decode,
  quotedPrintableEncode, quotedPrintableDecode,
  mimeWordEncode, mimeWordDecode,
  mimeWordsEncode, mimeWordsDecode,
  headerLineEncode, headerLinesDecode,
  continuationEncode,
  foldLines,
  parseHeaderValue
} = require('emailjs-mime-codec');


const authorization = async (user) => {
  const client = new ImapClient('imap.mail.ru', 993, {
    logLevel: 1000,
    auth: {
      user: user.login,
      pass: user.password,
    }
  });

  client.onerror = (err) => {
    throw new Error('Error IMAP handling:' + err);
  };

  return client
    .connect()
    .then(() => {
      return client
    })
    .catch(error => {
      throw error
    })
}

let reg = /<\/?(html|HTML|BODY|body|head|HEAD)>/g;
let CONTENT = [];

const getContent = (childNode) => {
  childNode.map((node) => {
    if (node.contentType.type.includes('image')) {
      CONTENT.push({
        type: 'image',
        name: node.contentType.params.name,
        content: '<nothing>',
      })
    }

    if (node.contentType.type.includes('text')) {
      const textContent = decode(node.content, '')
      if (textContent.match(reg) != null) {
        CONTENT.push({
          type: 'text',
          content: textContent.replace(reg, '')
        })
      }
    }
    if (node.contentType.type.includes('multipart')) {
      getContent(node.childNodes)
    }
  })
}

const recieve_message = async (client, boxPath, countGetMessages) => {
  const countMess = (await client.selectMailbox(boxPath)).exists
  const rangeMess = (countMess <= countGetMessages ? 0 : (countMess - countGetMessages)) + ':' + countMess
  return client.listMessages(boxPath, rangeMess, ['uid', 'flags', 'envelope', 'body.peek[]', 'bodystructure'])
    .then(mes => {
      return mes.map((message, i) => {
        CONTENT = []
        getContent(parse(message['body[]']).childNodes)
        return {
          id: message.uid,
          flags: message.flags,
          date: message.envelope.date,
          subj: message.envelope.subject,
          from: message.envelope.from,
          to: message.envelope.to,
          content: CONTENT,
        }
      })
    })
    .catch(err => {
      console.log(err)
      return undefined
    })
}

const recieve_mailbox = (client) => {
  return client.listMailboxes().then((mailboxes) => (
    mailboxes.children.map(el => ({
      name: el.name,
      path: el.path,
    }))
  ))

}

const delete_message = (client, path, uid) => {
  try {
    uid.map(element => {
      client.deleteMessages(path, element, { byUid: true })
    })
    return true
  }
  catch (err) {
    return false
  }
}

module.exports = { authorization, recieve_message, recieve_mailbox, delete_message };