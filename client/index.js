let START_POS = -1;
let USERNAME = '';

console.log("Connecting to module");

async function getChatStatus() {
  const response = await fetch("http://127.0.0.1:3000/message");
  const value = await response.json();
  return value.chat;
}

async function addMessage(message) {
  const data = { message: message, user: USERNAME};
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
  await getChatStatus().then((chatFromBack) => {
    console.log({chatFromBack})
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
    console.log({chatMessagesHtml});
    document.getElementById("chatbox").innerHTML = chatMessagesHtml;
  });
}

async function postJSON(data) {
  console.log("Sending data to server");
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

buildChat(10);
document
  .getElementById("message-button")
  .addEventListener("click", () => sendMessage());
let user = ""
updateUser(user);

const webSocket = new WebSocket("ws://localhost:8080");

webSocket.onopen = (event) => {
  webSocket.send("Here's some text that the server is urgently awaiting!");
};

webSocket.onmessage = (event) => {
  buildChat();
  console.log(event.data);
};

function updateUser(username){
  USERNAME = username;
  document.getElementById("username-value").innerHTML = username;
}

document.getElementById("user-form").addEventListener("submit", function(e) {
  e.preventDefault()
  console.log("Target data");
  const formData = new FormData(e.target);
  const formObj = Object.fromEntries(formData);
  updateUser(formObj.name);
})

