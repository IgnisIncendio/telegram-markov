const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

let win

function createWindow () {
  win = new BrowserWindow({width: 800, height: 600});
  win.loadURL(url.format({
    pathname: path.join(__dirname, "view.html"),
    protocol: "file:",
    slashes: true
  }));
  win.webContents.openDevTools({detach: true})
}

app.on("ready", createWindow);
