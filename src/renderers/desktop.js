import "../appLogic.js"

window.onload = () => {
  const mailboxList = ipcRenderer.sendSync('recieve_mailbox')
  const currentMailbox = ipcRenderer.sendSync('get_current_mailbox')
  window.ipcRenderer.send('recieve_messages', currentMailbox)

  mailboxList.map(el => {
    let button = document.createElement('button')
    button.className = "btn categ"
    button.textContent = el.name

    button.onclick = () => {
      Array.from(document.getElementsByClassName("categ")).forEach(element => {
        element.className = "btn categ"
      })
      button.className += " act"
      window.ipcRenderer.send('recieve_messages', el.path);
    }
    document.getElementById("message-categories").append(button);
  })
}

const createMessage = (list) => {
  return list.reverse().map((message, ind) => {
    let from = document.createElement('p')
    from.textContent = 'From: '
    message.from.map((el) => {
      from.textContent += el.address + ' '
    })

    let to = document.createElement('p')
    to.textContent = 'To: '
    message.to.map(el => {
      to.textContent += el.address
    })

    let subj = document.createElement('p')
    subj.textContent = 'Subj: ' + (message.subj != undefined ? message.subj : 'none')

    let title = document.createElement('div')
    title.className = "title "
    message.flags.map((flag) => {
      title.className += flag.replace(/\\/g, '')
    })
    title.append(from)
    title.append(to)
    title.append(subj)
    title.onclick = () => {
      window.ipcRenderer.send('open_mail_form', message);
    }

    let checkboxBut = document.createElement('input')
    checkboxBut.className = "ch-btn"
    checkboxBut.type = 'checkbox'
    checkboxBut.value = ind

    let messageDiv = document.createElement('div')
    messageDiv.className = "message "
    messageDiv.append(checkboxBut)
    messageDiv.append(title)
    return messageDiv
  })
}

const createNoMess = () => {
  let noMess = document.createElement("p")
  noMess.className = "no "+"message "
  noMess.textContent = "No messages"
  document.getElementById("messages-list").append(noMess)
}

window.ipcRenderer.on("message-reply", (event, list) => {
  let arrayList = Array.from(document.getElementsByClassName("message "))
  for(let i=0; i<arrayList.length; i++) {
    document.getElementById("messages-list").removeChild(arrayList[i])
  }

  const messagesDivList = createMessage(list)
  if(messagesDivList.length == 0) {
    createNoMess()
  }
  messagesDivList.map((messageBlock) => {
    document.getElementById("messages-list").append(messageBlock)
  })
})