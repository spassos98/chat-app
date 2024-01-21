import { getUsernameCookie } from './user.js'

let START_POS = -1;

console.log("Connecting to module");

function isHostanmeLocal() {
  const hostname = window.location.hostname;
  if (hostname == '127.0.0.1' || hostname == 'localhost') return true;
  return false;
}

async function fetchRedirect(path, data) {
  const hostname = window.location.hostname;
  return fetch(`http://${hostname}${isHostanmeLocal() ? ':3000' : ''}${path}`, data);
}

async function getChatStatus(roomId) {
  const response = await fetchRedirect(`/message/${roomId}`);
  const value = await response.json();
  return value.chat;
}

async function getRoomsInfo() {
  const response = await fetchRedirect("/room");
  const value = await response.json();
  return value.rooms;
}

async function addMessage(message) {
  const username = getUsernameCookie();
  const data = { message: message, user: username, roomId: getRoomId() };
  await postJSON(data);
}

export async function sendMessage() {
  let message = document.getElementById("message-box").value;
  document.getElementById("message-box").value = "";
  addMessage(message).then((_) => {
    buildChat(-1, getRoomId());
  });
}

function getRoomId() {
  const hashValue = getHash();
  if (hashValue == "") return "";
  else {
    return hashValue[1];
  }
}

const sendMessageEvent = () => sendMessage();
function showChat() {
  const chatValue = `
    <h2 id="chat-title">Chat</h2>
    <div id="chatbox" class="chatbox"></div>
    <div>
      <textarea id="message-box" cols="50" rows="3"></textarea>
    </div>
    <button id="message-button">Send</button>`;

  document.getElementById("chat").innerHTML = chatValue;
  buildChat(10, getRoomId());
  document
    .getElementById("message-button")
    .addEventListener("click", sendMessageEvent);
}

function hideChat() {
  const messageButton = document
    .getElementById("message-button")
  if (messageButton !== null) {
    removeEventListener("click", sendMessageEvent);
  }
  document.getElementById("chat").innerHTML = "";
}

export async function buildChat(limit = -1, roomId) {
  getChatStatus(roomId).then((chatFromBack) => {
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
  updateChatTitle(getHash());
}

export async function showRoomList() {
  getRoomsInfo().then((roomsInfo) => {
    let roomInfoHtml = "<ul>\n";
    for (let i = 0; i < roomsInfo.length; i += 1) {
      roomInfoHtml += `<li> <a href="#${roomsInfo[i].id}">${roomsInfo[i].name}</a></li>\n`;
    }
    roomInfoHtml += "\n</ul>";
    document.getElementById("room-list").innerHTML = roomInfoHtml;
  });
}

export async function hideRoomList() {
  document.getElementById("room-list").innerHTML = "";
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
    const response = await fetchRedirect("/message", config);

    await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
}

function updateChatTitle(roomNumber) {
  document.getElementById("chat-title").innerHTML = `Chat for room ${roomNumber[1]}`;
}

const webSocket = new WebSocket(`ws://${window.location.hostname}:8080/ws`);

webSocket.onopen = (event) => {
  webSocket.send("Here's some text that the server is urgently awaiting!");
};

webSocket.onmessage = (event) => {
  if (getHash() !== "") buildChat(10, getRoomId());
};

// hash utilities, will move to a different module
function getHash() {
  let theHash = window.location.hash;
  if (theHash.length == 0) { theHash = ""; }
  return theHash;
}

function onHashChange(hashValue) {
  if (hashValue == "") {
    hideChat();
    showRoomList();
  } else {
    showChat();
    hideRoomList();
  }
}

window.addEventListener("hashchange", function() {
  const hashValue = getHash();
  onHashChange(hashValue);
});

window.addEventListener("DOMContentLoaded", function(ev) {
  const hashValue = getHash();
  onHashChange(hashValue);
});
