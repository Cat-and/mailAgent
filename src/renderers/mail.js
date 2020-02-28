document.getElementById("to-menu").onmouseup = (event) => {
  window.ipcRenderer.send('open_desktop')
}

window.onload = () => {
  const currentMessage = ipcRenderer.sendSync('get_current_message') 
  console.log(currentMessage)

  currentMessage.from.map((addr) => {
    document.getElementById("title-from").textContent += " " + addr.address
  })
  currentMessage.to.map((addr) => {
    document.getElementById("title-to").textContent += " " + addr.address 
  })


currentMessage.content.map(element => {
  if(element.type.includes('text')) {
    document.getElementById("message-text").innerHTML = element.content
  }
  if(element.type.includes('image')) {
    let attach_doc = document.createElement('div')
    attach_doc.className = "attached-document"
    let content = document.createElement('div')
    let name = document.createElement('p')
    content.textContent = element.content
    name.textContent = element.name
    attach_doc.append(content)
    attach_doc.append(name)
    document.getElementById("attached-field").append(attach_doc)

  }
})


}