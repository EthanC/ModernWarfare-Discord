const { ipcRenderer } = require("electron");

const btnRandomize = document.getElementById("randomize");
const btnToLobby = document.getElementById("toLobby");

btnRandomize.addEventListener("click", () => {
    ipcRenderer.send("randomize");
});

btnToLobby.addEventListener("click", () => {
    ipcRenderer.send("toLobby");
});
