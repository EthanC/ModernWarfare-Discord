const {
    smallModes,
    smallMaps,
    standardModes,
    standardMaps,
    largeModes,
    largeMaps,
    mapIds
} = require("./gameData");
const { getRandom } = require("./util");
const { app, BrowserWindow, ipcMain } = require("electron");
const client = require("discord-rich-presence")("609225497783828484");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    win.loadFile("index.html");

    // Open the DevTools.
    // win.webContents.openDevTools();

    // Hide the menu bar.
    win.setMenu(null);

    // Begin Rich Presence loop.
    init();

    // Emitted when the window is closed.
    win.on("closed", () => {
        client.disconnect();

        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

function init(mode) {
    var main = function(mode) {
        var interval = getActivity(mode);
        loop = setTimeout(main, interval);
    };

    ipcMain.on("randomize", () => {
        clearTimeout(loop);
        main();
    });

    ipcMain.on("toLobby", () => {
        clearTimeout(loop);
        main("Lobby");
    });

    main(mode);
}

function getActivity(mode) {
    if (mode !== "Lobby") {
        var size = getRandom(["smallModes", "standardModes", "largeModes"]);
        if (size === "smallModes") {
            var mode = getRandom(smallModes);
        } else if (size === "standardModes") {
            var mode = getRandom(standardModes);
        } else if (size === "largeModes") {
            var mode = getRandom(largeModes);
        }
    }

    if (smallModes.includes(mode)) {
        // 3.25m to 5m
        var min = 195;
        var max = 300;

        var map = getRandom(smallMaps);
    } else if (standardModes.includes(mode)) {
        // 6.5m to 10m
        var min = 390;
        var max = 600;

        var map = getRandom(standardMaps);
    } else if (largeModes.includes(mode)) {
        // 27.5m to 45m
        var min = 1635;
        var max = 2700;

        var map = getRandom(largeMaps);
    } else if (mode === "Lobby") {
        // 4s to 18s
        var min = 4;
        var max = 18;

        var map = "Lobby";

        const lobbySizes = [2, 4, 6, 12, 50, 100];
        var maxPlayers = getRandom(lobbySizes);
        var playerCount = Math.floor(Math.random() * maxPlayers);

        if (playerCount < 2) {
            var lobbyState = "Matchmaking";
        } else {
            var lobbyState = playerCount + " of " + maxPlayers + " players";
        }
    }

    if (mode === "Lobby") {
        var state = lobbyState;
        var details = "In a Pre-Game Lobby";
    } else {
        var state = mode + " on " + map;
        var details = "Playing Online Multiplayer";
    }
    var startTimestamp = new Date();
    var largeImageKey = mapIds[map];
    var largeImageText = map;

    setPresence(state, details, startTimestamp, largeImageKey, largeImageText);

    // Random duration (ms) between provided minimum and maximum.
    var interval = Math.floor(Math.random() * (max - min + 1) + min) * 1000;

    return interval;
}

function setPresence(
    state,
    details,
    startTimestamp,
    largeImageKey,
    largeImageText
) {
    client.updatePresence({
        state: state,
        details: details,
        startTimestamp,
        largeImageKey: largeImageKey,
        largeImageText: largeImageText,
        smallImageKey: "mw_logo",
        smallImageText: "Call of Duty®: Modern Warfare"
    });
}
