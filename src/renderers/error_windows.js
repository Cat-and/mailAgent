window.onload = () => {
  const info = window.ipcRenderer.sendSync('get_info')
  if (info.includes("Could not open")) {
    createMessageError('Error: Could not open socket:', "Check your internet connection")
    buttonBehavior('open_login_form')
  }
  if (info.includes("Authentication failed")) {
    createMessageError('Authentication failed', "Enter another login or password")
    buttonBehavior('open_login_form')
  }
  if (info.includes("Success")) {
    createMessageError(info, "Message sent")
    buttonBehavior('open_desktop')
  }
  if (info.includes("Message not sent")) {
    createMessageError(info, "Try another time")
    buttonBehavior('open_desktop')
  }
}


const createMessageError = (title, text) => {
  let warningTitle = document.createElement('p')
  warningTitle.textContent = title
  warningTitle.className = "title"
  let warningText = document.createElement('p')
  warningText.textContent = text
  warningText.className = 'text'
  document.getElementById('message').append(warningTitle)
  document.getElementById('message').append(warningText)

}

const buttonBehavior = (open_win) => {
  document.getElementById('go-login').onclick = (event) => {
    window.ipcRenderer.send(open_win);
  }
}

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault()
    document.getElementById('go-login').onclick()
  }
})