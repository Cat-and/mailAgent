const { app, BrowserWindow, ipcMain } = require('electron')
const { authorization, recieve_mailbox, recieve_message, delete_message } = require('./mail/imap')

require('electron-reload')('.');

let client;
let user = {
  login: "",
  password: "",
};

let mailbox = [];
let current_mailbox = "INBOX";
let current_message;
let numberOfPost = 0;
let error_message = ""


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
    resizable: false,
  })

  win.loadFile('html/login.html')

  const open_desktop = () => {
    win.loadFile('html/desktop.html').then(() => {
      win.setSize(800, 600);
      win.center();
    })
  }

  const open_small_windows = (URL) => {
    win.loadFile(URL).then(() => {
      win.setSize(340, 210);
      win.center();
    })
  }

  const open_mail_form = () => {
    win.loadFile('html/mail.html').then(() => {
      win.setSize(300, 600)
      win.center()
    })
  }

  const request_box = async () => {
    mailbox = await recieve_mailbox(client)
  }

  const addNumberOfPost = (path) => {
    if (path != current_mailbox && path != undefined) {
      numberOfPost = 20
    }
    if (path == current_mailbox || path == undefined) {
      numberOfPost += 20;
    }
  }

  ipcMain.on('recieve_messages', async (event, path) => {
    addNumberOfPost(path);
    if (path != undefined) {
      current_mailbox = path
    }
    event.reply("message-reply", await recieve_message(client, current_mailbox, numberOfPost))
  })

  ipcMain.on('recieve_mailbox', (event) => {
    event.returnValue = mailbox
  })

  //Авторизация в системе
  ipcMain.on('authorization', (event, args) => {
    user.login = args.login;
    user.password = args.password;

    authorization(user).then((cl) => {
      error = ""
      client = cl
      request_box();
      open_desktop()
    }).catch((err) => {
      client = undefined
      console.log('ERROR: ' + err.toString().includes("A"))

      if(err.toString().includes("Could not open socket"))
      {
        error_message = "No connection"
        open_small_windows('html/error_windows.html')
      }
      if (err.toString().includes("Authentication failed")) {
        error_message = "Authorization error"
        open_small_windows('html/error_windows.html')
      }/**/
    });
  })

  ipcMain.on('get_error', (event) => {
    event.returnValue = error_message;
  })

  ipcMain.on('open_desktop', (event) => {
    current_message = undefined
    open_desktop();
  })

  ipcMain.on('open_mail_form', (event, message) => {
    current_message = message;
    open_mail_form();
  })

  ipcMain.on('get_current_message', (event) => {
    event.returnValue = current_message
  })

  ipcMain.on('open_login_form', (event) => {
    open_small_windows('html/login.html')
  })

  ipcMain.on('exit', () => {
    app.exit()
  })

  ipcMain.on('deleteMasseges', async (event, selectedMessages) => {
    if (await delete_message(client, current_mailbox, selectedMessages)) {
      event.reply("message-reply", await recieve_message(client, current_mailbox, numberOfPost))
    }
    else {
      console.log("Fail deleted")
    }
  })

}

app.whenReady().then(createWindow)