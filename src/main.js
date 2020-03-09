const { app, BrowserWindow, ipcMain } = require('electron')
const {
  sendMail,
  getMailboxes,
  getMessage,
  getMessagesInfo,
  getMailboxSize,
  deleteMessages
} = require('../src/mail/mail')

require('electron-reload')('.');

const createWindow = () => {
  const preloadPath = app.getAppPath() + '\\src\\preload.js'

  const win = new BrowserWindow({
    width: 340,
    height: 210,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: preloadPath
    },
  })

  win.loadFile('html/login.html')


  //Global variable
  let user = {
    login: "",
    password: "",
  };
  let resultInfo = ""
  let mailboxes = []
  let current_mailbox = "INBOX"
  let beginBound = 0
  let endBound = 0
  let current_message

  // Дополнительные функции
  const getNextBounds = () => {
    beginBound -= 20
    endBound -= 20
    if (beginBound < 1) beginBound = 1
  }

  const initializeRange = async () => {
    const mailboxSize = await getMailboxSize(user, current_mailbox)
    endBound = mailboxSize
    beginBound = mailboxSize - 19
  }

  // Установка размера новых окон
  const open_desktop = () => {
    win.hide()
    win.loadFile('html/desktop.html').then(() => {
      win.setSize(800, 600);
      win.center();
      win.show()
    })
  }

  const open_info_windows = (URL) => {
    win.hide()
    win.loadFile(URL).then(() => {
      win.setSize(340, 210);
      win.center();
      win.show()
    })
  }

  const open_form_letters = (URL) => {
    win.hide()
    win.loadFile(URL).then(() => {
      win.setSize(400, 600)
      win.center()
      win.show()
    })
  }

  const open_login = () => {
    win.hide()
    win.loadFile('html/login.html').then(() => {
      win.setSize(340, 210)
      win.center()
      win.show()
    })
  }

  //Обработчики событий
  ipcMain.on("log_in", async (event, _user) => {
    user = {
      login: _user.login,
      password: _user.password,
    }
    try {
      mailboxes = await getMailboxes(user)
      initializeRange();
      open_desktop()
    }
    catch (err) {
      resultInfo = err.toString();
      open_info_windows('html/error_windows.html')
    }
  })

  ipcMain.on("get_mailboxes", (event) => {
    event.returnValue = mailboxes
  })

  ipcMain.on('get_messages_amount', async (event, path) => {
    event.returnValue = await getMailboxSize(user, path)
  })

  ipcMain.on('get_messages_info', async (event, path) => {
    if (path && current_mailbox != path) {
      current_mailbox = path
      await initializeRange()
      event.reply('clear_messages_list')
    }
    if (endBound > 0) {
      event.reply('messages_info', await getMessagesInfo(user, current_mailbox, beginBound, endBound))
      getNextBounds()
    }
  })

  ipcMain.on('delete_letters', async (event, messegesListToDelete) => {
    event.returnValue = (await deleteMessages(user, current_mailbox, messegesListToDelete.toString())).command
  })

  ipcMain.on("open_send_form", (event) => {
    open_form_letters('html/sendMail.html')
  })

  ipcMain.on('open_read_form', (event, uid) => {
    current_message = uid
    open_form_letters('html/readMail.html')
  })

  ipcMain.on("send_letter", async (event, letter) => {
    try {
      await sendMail(user, letter)
      resultInfo = "Success"
    } catch (error) {
      resultInfo = "Message not sent"
    } finally {
      open_info_windows('html/error_windows.html')
    }
  })

  ipcMain.on('get_user_name', (event) => {
    event.returnValue = user.login.toString()
  })

  ipcMain.on('open_desktop', () => {
    initializeRange()
    open_desktop()
  })

  ipcMain.on('get_info', (event) => {
    event.returnValue = resultInfo
  })

  ipcMain.on('open_login_form', () => {
    open_login()
  })

  ipcMain.on('get_current_message', async (event) => {
    event.returnValue = await getMessage(user, current_mailbox, current_message)
  })

  ipcMain.on('exit', () => {
    app.exit()
  })
}

app.whenReady().then(createWindow)