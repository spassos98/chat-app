import { getUsernameCookie } from './user.js'

let START_POS = -1;

console.log("Connecting to module");


async function getChatStatus() {
  const response = await fetch("http://127.0.0.1:3000/message");
  const value = await response.json();
  return value.chat;
}

async function getRoomsInfo() {
  const response = await fetch("http://127.0.0.1:3000/room");
  const value = await response.json();
  return value.rooms;
}

async function addMessage(message) {
  const username = getUsernameCookie();
  const data = { message: message, user: username, roomId: 1 };
  await postJSON(data);
}

export async function sendMessage() {
  let message = document.getElementById("message-box").value;
  document.getElementById("message-box").value = "";
  addMessage(message).then((_) => {
    buildChat();
  });
}

export async function buildChat(limit = -1) {
  getChatStatus().then((chatFromBack) => {
    if (limit >= 0) {
      START_POS = chatFromBack.length - limit;
      START_POS = Math.max(0, START_POS);
    }
    let chatMessagesHtml = "<ul>\n";
    let i = START_POS;
    for (i; i < chatFromBack.length; i += 1) {
      chatMessagesHtml += `<li><b>${chatFromBack[i].user ?? ''}</b>: ${chatFromBack[i].message}</li>\n`;
    }
    chatMessagesHtml += "\n</ul>";
    document.getElementById("chatbox").innerHTML = chatMessagesHtml;
  });
}

export async function buildRoomList() {
  getRoomsInfo().then((roomsInfo) => {
    let roomInfoHtml = "<ul>\n";
    for (let i = 0; i < roomsInfo.length; i += 1) {
      roomInfoHtml += `<li> <a href="#${roomsInfo[i].id}">${roomsInfo[i].name}</a></li>\n`;
    }
    roomInfoHtml += "\n</ul>";
    document.getElementById("room-list").innerHTML = roomInfoHtml;
  });
}

async function postJSON(data) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const config = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const response = await fetch("http://127.0.0.1:3000/message", config);

    await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
}

function updateChatTitle(roomNumber){
  document.getElementById("chat-title").innerHTML = `Chat for room ${roomNumber[1]}`;
}

buildChat(10);
buildRoomList();
document
  .getElementById("message-button")
  .addEventListener("click", () => sendMessage());

const webSocket = new WebSocket("ws://localhost:8080");

webSocket.onopen = (event) => {
  webSocket.send("Here's some text that the server is urgently awaiting!");
};

webSocket.onmessage = (event) => {
  buildChat();
};

// hash utilities, will move to a different module
function getHash() {
  const theHash = window.location.hash;
  if (theHash.length == 0) { theHash = ""; }
  return theHash;
}

window.addEventListener("hashchange", function() {
  const hashValue = getHash();
  updateChatTitle(hashValue)
});

window.addEventListener("DOMContentLoaded", function(ev) {
  const hashValue = getHash();
  updateChatTitle(hashValue)
});
