document.getElementById("to-menu").onmouseup = (event) => {
  window.ipcRenderer.send('open_desktop')
}

window.onload = () => {
  const message = ipcRenderer.sendSync('get_current_message')

  message.info.from.map((addr) => {
    document.getElementById("title-from").textContent += " " + addr.address
  })
  message.info.to.map((addr) => {
    document.getElementById("title-to").textContent += " " + addr.address
  })

  if (message.body.html) {
    document.getElementById("message-text").innerHTML = message.body.html
  }
  else {
    document.getElementById("message-text").textContent = message.body.text
  }

  if (message.body.attachments) {
    message.body.attachments.map(element => {
      const attachmentInfo = document.createElement("div")
      attachmentInfo.classList.add("attached-document")
      attachmentInfo.innerText = element.filename

      const attachmentButton = document.createElement("div")
      attachmentButton.classList.add("btn")
      attachmentButton.innerText = "download"
      attachmentButton.onclick = () => {
        downloadAttachment(element.content, element.filename, element.contentType)
      }
      attachmentInfo.append(attachmentButton)
      document.getElementById('attached-field').append(attachmentInfo)
    })
  }
}

const downloadURL = (data, fileName) => {
  const tempLink = document.createElement('a');
  tempLink.href = data;
  tempLink.download = fileName;
  document.body.appendChild(tempLink);
  tempLink.style = 'display: none';
  tempLink.click();
  tempLink.remove();
};

const downloadAttachment = (data, fileName, contentType) => {
  const blob = new Blob([data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};