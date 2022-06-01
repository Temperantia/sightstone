const { app, nativeTheme, BrowserWindow } = require("electron");
const serve = require("electron-serve");
const fs = require("fs");
const ws = require("electron-window-state");
try {
  require("electron-reloader")(module);
} catch {}

const loadURL = serve({ directory: "." });
const PORT = process.env.PORT || 3000;
const isdev = !app.isPackaged || process.env.NODE_ENV == "development";
let mainwindow;

const pathToLockfile =
  process.platform === "win32"
    ? "C:/Riot Games/League of Legends/lockfile"
    : "/Applications/League of Legends.app/Contents/LoL/lockfile";
const lockfile = fs.readFileSync(pathToLockfile).toString();
const [_name, _username, port, password] = lockfile.split(":");

function loadVite(PORT) {
  mainwindow.loadURL(`http://127.0.0.1:${PORT}`).catch((err) => {
    setTimeout(() => {
      loadVite(PORT);
    }, 200);
  });
}



function createMainWindow() {
  nativeTheme.themeSource = "light";
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
      nodeIntegration: true,
      contextIsolation: false,
      devTools: isdev,
    },
  });

  mainwindow.once("close", () => {
    mainwindow = null;
  });

  if (!isdev) mainwindow.removeMenu();
  else mainwindow.webContents.openDevTools();

  mws.manage(mainwindow);

  if (isdev) loadVite(PORT);
  else loadURL(mainwindow);
}

app.once("ready", createMainWindow);
app.on("activate", () => {
  if (!mainwindow) createMainWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
