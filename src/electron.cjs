const { app, ipcMain, BrowserWindow } = require("electron");
const serve = require("electron-serve");
const ws = require("electron-window-state");
const fs = require("fs");
try {
  require("electron-reloader")(module);
} catch {}

const pathToLockfile =
  process.platform === "win32"
    ? "C:/Riot Games/League of Legends/lockfile"
    : "/Applications/League of Legends.app/Contents/LoL/lockfile";
const loadURL = serve({ directory: "." });
const port = process.env.PORT || 3000;
const isdev = !app.isPackaged || process.env.NODE_ENV == "development";
let mainwindow;

function loadVite(port) {
  mainwindow.loadURL(`http://127.0.0.1:${port}`).catch((err) => {
    setTimeout(() => {
      loadVite(port);
    }, 200);
  });
}

function createMainWindow() {
  let mws = ws({
    defaultWidth: 1000,
    defaultHeight: 800,
  });

  mainwindow = new BrowserWindow({
    x: mws.x,
    y: mws.y,
    width: mws.width,
    height: mws.height,

    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
  });

  mainwindow.once("close", () => {
    mainwindow = null;
  });

  if (!isdev) mainwindow.removeMenu();
  else mainwindow.webContents.openDevTools();

  mws.manage(mainwindow);

  if (isdev) loadVite(port);
  else loadURL(mainwindow);
}

app.once("ready", createMainWindow);
app.on("activate", () => {
  if (!mainwindow) createMainWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
  }
);

ipcMain.on("variable-request", function (event, arg) {
  let lockfile;
  if (fs.existsSync(pathToLockfile)) {
    lockfile = fs.readFileSync(pathToLockfile).toString();
  }
  const [_name, _username, port, password] = lockfile?.split(":") ?? [];

  event.sender.send("variable-reply", [port, password]);
});
