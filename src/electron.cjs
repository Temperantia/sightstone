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

async function createMainWindow() {
  nativeTheme.themeSource = "light";
  /*   let mws = ws({
    defaultWidth: 1000,
    defaultHeight: 800,
  }); */

  mainwindow = new BrowserWindow({
    /*     x: mws.x,
    y: mws.y, */
    width: 1200,
    height: 800,

    webPreferences: {
      webSecurity: false,
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

  /*   mws.manage(mainwindow);
   */

  let lockfile;
  if (fs.existsSync(pathToLockfile)) {
    lockfile = fs.readFileSync(pathToLockfile).toString();
  }
  const [_name, _username, port, password] = lockfile?.split(":") ?? [];

  if (isdev) {
    mainwindow.loadURL(
      `http://127.0.0.1:${PORT}?port=${port}&password=${password}`
    );
  } else await mainwindow.loadURL(`app://-?port=${port}&password=${password}`);
  //else loadURL(mainwindow);
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
