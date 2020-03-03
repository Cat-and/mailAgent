import "../appLogic.js"

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault()
    document.getElementById('login_form').onsubmit()
  }
})

document.getElementById('login_form').onsubmit = (event) => {
  const login = document.getElementById("log").value.replace(/\s/g,'')
  const password = document.getElementById("pass").value.replace(/\s/g,'')
  if(login == '' || password == '') return;
  window.ipcRenderer.send('authorization', { login, password });
}
