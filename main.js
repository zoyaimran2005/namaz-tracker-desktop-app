const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 250,
    height: 420,
    useContentSize: true,
    resizable: false,
    frame: false,
    transparent: true,
    // Use path.join for window & dock icon
    icon: path.join(__dirname, 'assets/icons8-moon-100.icns'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Use path.join to resolve relative index.html inside packaged .asar bundle
  win.loadFile(path.join(__dirname, 'index.html'));
}

// THIS IS THE EQUIVALENT FIX FOR ELECTRON MAIN PROCESS:
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});