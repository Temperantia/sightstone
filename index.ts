import { app, BrowserWindow, nativeTheme, ipcMain } from "electron";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  nativeTheme.themeSource = "light";
  createWindow();
});
