document.getElementById('go-login').onclick = (event)=>  {
window.ipcRenderer.send('open_login_form');
}

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault()
    document.getElementById('go-login').onclick()
  }
})