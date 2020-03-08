const SmtpClient = require('emailjs-smtp-client').default;

const sendMessage = (user, letter, on_success, on_error) => {
  const client = new SmtpClient('smtp.mail.ru', 465, {
    auth: {
      user: user.login,
      pass: user.password,
    }
  })
  client.connect()

  client.ondone = (success) => {
    console.log("DONE!!!" + success)
    on_success()
  }

  client.onerror = (err) => {
    console.log("ERROR!!!" + err)
    on_error()
  }

  client.onclose = (iserror) => {
    console.log("CLOSE!!! " + iserror)
    client.close()
  }

  let alreadySending = false;

  client.onidle = () => {
    console.log("ONIDLE!!!")

    if (alreadySending) return

    alreadySending = true
    client.useEnvelope({
      from: letter.from,
      to: [...letter.to],
    })
  }

  client.onready = () => {
    console.log("ONREADY")
    client.send(`Subject: ${letter.subj}\r\n`);
    client.send("\r\n");
    client.send(letter.text);
    client.end();
  }
}


const send_letter = (user, letter, on_success, on_error) => {
  sendMessage(user, letter, on_success, on_error)
}

module.exports = { send_letter }