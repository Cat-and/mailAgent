document.getElementsByClassName('exit')[0].onclick = (event) => {
  window.ipcRenderer.send('exit')
}

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 27) {
    event.preventDefault()
    document.getElementsByClassName('exit')[0].onclick()
  }
})