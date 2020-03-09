document.getElementById("to-menu").onclick = () => {
  window.ipcRenderer.send('open_desktop')
}

window.onload = () => {
  let from = window.ipcRenderer.sendSync('get_user_name')
  document.getElementById("title-from").textContent = from
}

document.getElementById("add-file").onclick = () => {
  var input = document.createElement('input');
  input.type = 'file';

  input.onchange = element => {
    Array.from(element.target.files).forEach(file => {
      const attachmentInfo = document.createElement("div")
      attachmentInfo.classList.add("attachment-info")
      attachmentInfo.fileName = file.name
      attachmentInfo.filePath = file.path
      attachmentInfo.fileType = file.type
      attachmentInfo.innerText = file.name

      const deleteAttachmentButton = document.createElement("div")
      deleteAttachmentButton.classList.add("btn")
      deleteAttachmentButton.innerText = "x"
      deleteAttachmentButton.onclick = () => {
        document.getElementById('attachments').removeChild(attachmentInfo)
      }

      attachmentInfo.append(deleteAttachmentButton)

      document.getElementById('attachments').append(attachmentInfo)
    });
  }
  input.click();
}

document.getElementById("submit").onclick = () => {
  if (document.getElementById("title-to").value) {
    const toList = document.getElementById("title-to").value
      .split(" ")
      .filter(el => el != "")
      .map(el => { return el.replace(/\s/g, '') })
    
      const sendattachments = Array.from(document.getElementById("attachments").children).map(attachment => ({
      filename: attachment.fileName,
      path: attachment.filePath,
      contentType: attachment.fileType
    }))
    
    letter = {
      to: [...new Set(toList)],
      subj: document.getElementById("subj").value,
      text: document.getElementById("message").value,
      attachments: sendattachments,
    }
    ipcRenderer.send("send_letter", letter)
  }
  else {
    document.getElementById("title-to").className += "err "
  }
}

document.getElementById("title-to").onchange = () => {
  document.getElementById("title-to").className = ""
}
