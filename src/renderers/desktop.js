import "../appLogic.js"

let preventNextMessagesLoading = false

window.onload = () => {
  const mailboxes = window.ipcRenderer.sendSync('get_mailboxes')
  createMailboxButtons(mailboxes)
  window.ipcRenderer.send('get_messages_info')
}

const createMailboxButtons = (mailboxes) => {
  mailboxes.map(box => {
    let button = document.createElement('button')
    button.className = "btn categ"
    const messagesAmount = window.ipcRenderer.sendSync('get_messages_amount', box.path)
    button.textContent = box.name + " " + messagesAmount

    button.onclick = () => {
      Array.from(document.getElementsByClassName("categ")).forEach(element => {
        element.className = "btn categ"
      })
      button.className += " act"
      window.ipcRenderer.send('get_messages_info', box.path);
    }
    document.getElementById("message-categories").append(button);
  })
}

window.ipcRenderer.on('clear_messages_list', (event) => {
  let messagesList = Array.from(document.getElementsByClassName("message "))
  removeMessageList(messagesList)
})

window.ipcRenderer.on("messages_info", (event, list) => {
  const messagesDivList = createMessage(list)
  if (messagesDivList.length == 0) {
    createNoMess()
  }
  messagesDivList.map((messageBlock) => {
    document.getElementById("messages-list").append(messageBlock)
  })
  preventNextMessagesLoading = false
})

const removeMessageList = (messagesList) => {
  for (let i = 0; i < messagesList.length; i++) {
    document.getElementById("messages-list").removeChild(messagesList[i])
  }
}

const createMessage = (list) => {
  return list.reverse().map((message) => {
    let from = document.createElement('p')
    from.textContent = 'From: '
    message.envelope.from.map((el) => {
      from.textContent += el.address + ' '
    })

    let to = document.createElement('p')
    to.textContent = 'To: '

    if (message.envelope.to) {
      message.envelope.to.map(el => {
        to.textContent += el.address
      })
    }
    else {
      to.textContent += "Unknown"
    }

    let subj = document.createElement('p')
    subj.textContent = 'Subj: ' + (message.envelope.subject != undefined ? message.envelope.subject : 'none')

    let title = document.createElement('div')
    title.className = "title "
    message.flags.map((flag) => {
      title.className += flag.replace(/\\/g, '')
    })
    title.append(from)
    title.append(to)
    title.append(subj)
    title.onclick = () => {
      window.ipcRenderer.send('open_read_form', message.uid)
    }

    let checkboxBut = document.createElement('input')
    checkboxBut.className = "ch-btn"
    checkboxBut.type = 'checkbox'
    checkboxBut.value = message.uid

    let messageDiv = document.createElement('div')
    messageDiv.className = "message " + "uid"+message.uid
    messageDiv.append(checkboxBut)
    messageDiv.append(title)
    return messageDiv
  })
}

const createNoMess = () => {
  let noMess = document.createElement("p")
  noMess.className = "no " + "message "
  noMess.textContent = "No messages"
  document.getElementById("messages-list").append(noMess)
}

document.getElementById('messages-list').onscroll = (event) => {
  const visibleHeight = event.target.clientHeight
  const scrollHeight = event.target.scrollHeight
  const scrollPosition = event.target.scrollTop
  if (scrollPosition > scrollHeight - visibleHeight * 3 && !preventNextMessagesLoading) {
    preventNextMessagesLoading = true
    window.ipcRenderer.send('get_messages_info')
  }
}

document.getElementById('delete').onclick = async () => {
  const messages = Array.from(document.getElementsByClassName('ch-btn'))
  let selectedMessages = []
  let count = 0;
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].checked) {
      selectedMessages[count] = messages[i].value;
      count++;
    }
  }
  if (selectedMessages.length > 0) {
    if ((await ipcRenderer.sendSync('delete_letters', selectedMessages)) == "OK") {
      deleteMessageDiv(selectedMessages)
    }
  }
}

const deleteMessageDiv = (selectedMessages) => {
  selectedMessages.map(id => {
    const deletedMessege = document.getElementsByClassName('uid'+id)[0]
    document.getElementById("messages-list").removeChild(deletedMessege)
  }) 
}

document.getElementById('write_letter').onclick = () => {
  window.ipcRenderer.send('open_send_form')
}