window.onload = () => {
  const error =  window.ipcRenderer.sendSync('get_error')
  if(error.includes("No connection"))
  {
    createMEssageError(error, "Check your internet connection")
  }
  if(error.includes("Authorization error"))
  {
    createMEssageError(error, "Enter another login or password")
  }
}

const createMEssageError = (title, text) => {
  let warningTitle = document.createElement('p')
  warningTitle.textContent = title
  warningTitle.className = "title"
  let warningText = document.createElement('p')
  warningText.textContent= text
  warningText.className = 'text'
  document.getElementById('message').append(warningTitle)
  document.getElementById('message').append(warningText)
  
}

document.getElementById('go-login').onclick = (event)=>  {
window.ipcRenderer.send('open_login_form');
}

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault()
    document.getElementById('go-login').onclick()
  }
})