const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  screen,
  globalShortcut,
} = require("electron");
const fs = require("fs");
const path = require("path");

let win;
let tray = null;
let dragState = null;

const WINDOW_SIZE = {
  width: 260,
  height: 310,
};

const SNAP_DISTANCE = 36;
const RESET_MARGIN = 80;
const TOGGLE_SHORTCUT = "CommandOrControl+Shift+B";
const DEV_RELOAD_DELAY = 180;

function getDefaultBounds() {
  const { workArea } = screen.getPrimaryDisplay();

  return {
    x: Math.round(
      workArea.x + workArea.width - WINDOW_SIZE.width - RESET_MARGIN,
    ),
    y: Math.round(
      workArea.y + workArea.height - WINDOW_SIZE.height - RESET_MARGIN,
    ),
    width: WINDOW_SIZE.width,
    height: WINDOW_SIZE.height,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function snapBounds(bounds) {
  const display = screen.getDisplayMatching(bounds);
  const area = display.workArea;
  let nextX = clamp(bounds.x, area.x, area.x + area.width - bounds.width);
  let nextY = clamp(bounds.y, area.y, area.y + area.height - bounds.height);

  const distanceToLeft = Math.abs(nextX - area.x);
  const distanceToRight = Math.abs(
    area.x + area.width - (nextX + bounds.width),
  );
  const distanceToTop = Math.abs(nextY - area.y);
  const distanceToBottom = Math.abs(
    area.y + area.height - (nextY + bounds.height),
  );

  if (distanceToLeft <= SNAP_DISTANCE) {
    nextX = area.x;
  } else if (distanceToRight <= SNAP_DISTANCE) {
    nextX = area.x + area.width - bounds.width;
  }

  if (distanceToTop <= SNAP_DISTANCE) {
    nextY = area.y;
  } else if (distanceToBottom <= SNAP_DISTANCE) {
    nextY = area.y + area.height - bounds.height;
  }

  return {
    x: Math.round(nextX),
    y: Math.round(nextY),
  };
}

function resetWindowPosition() {
  if (!win) return;

  const bounds = getDefaultBounds();
  win.setBounds(bounds, true);
  win.show();
}

function toggleWindow() {
  if (!win) return;

  if (win.isVisible()) {
    win.hide();
  } else {
    win.showInactive();
    win.setAlwaysOnTop(true, "screen-saver");
  }
}

function setupDevWatcher() {
  if (app.isPackaged || process.env.BUNNY_DISABLE_WATCH === "1") return;

  const targets = [
    { file: "main.js", action: "restart" },
    { file: "preload.js", action: "reload" },
    { file: "index.html", action: "reload" },
    { file: path.join("assets", "bunny"), action: "reload" },
  ];
  let reloadTimer = null;
  let restartTimer = null;

  function scheduleReload() {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      if (win && !win.isDestroyed()) {
        win.webContents.reloadIgnoringCache();
      }
    }, DEV_RELOAD_DELAY);
  }

  function scheduleRestart() {
    clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
      app.relaunch();
      app.exit(0);
    }, DEV_RELOAD_DELAY);
  }

  for (const target of targets) {
    const absolutePath = path.join(__dirname, target.file);
    if (!fs.existsSync(absolutePath)) continue;

    fs.watch(absolutePath, { persistent: false }, () => {
      if (target.action === "restart") {
        scheduleRestart();
      } else {
        scheduleReload();
      }
    });
  }
}

function createWindow() {
  win = new BrowserWindow({
    ...getDefaultBounds(),
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: true,
    hasShadow: false,
    fullscreenable: false,
    backgroundColor: "#00000000",
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.webContents.session.webRequest.onBeforeRequest(
    { urls: ["http://*/*", "https://*/*"] },
    (_details, callback) => {
      callback({ cancel: true });
    },
  );

  win.loadFile("index.html");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, "screen-saver");

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  createWindow();
  setupDevWatcher();

  tray = new Tray(path.join(__dirname, "icon.png"));
  tray.setToolTip("兔子看板娘");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示 / 隐藏",
      accelerator: TOGGLE_SHORTCUT,
      click: toggleWindow,
    },
    {
      label: "重置位置",
      click: resetWindowPosition,
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  globalShortcut.register(TOGGLE_SHORTCUT, toggleWindow);
});

ipcMain.on("pet-drag-start", () => {
  if (!win) return;

  dragState = {
    cursor: screen.getCursorScreenPoint(),
    bounds: win.getBounds(),
  };
});

ipcMain.on("pet-drag-move", () => {
  if (!win || !dragState) return;

  const cursor = screen.getCursorScreenPoint();
  const nextX = dragState.bounds.x + cursor.x - dragState.cursor.x;
  const nextY = dragState.bounds.y + cursor.y - dragState.cursor.y;

  win.setPosition(Math.round(nextX), Math.round(nextY), false);
});

ipcMain.on("pet-drag-end", () => {
  if (!win || !dragState) return;

  const nextPosition = snapBounds(win.getBounds());
  dragState = null;
  win.setPosition(nextPosition.x, nextPosition.y, true);
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
