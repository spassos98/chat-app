let START_POS = -1;

async function getChatStatus() {
  const response = await fetch("http://127.0.0.1:3000/message");
  const value = await response.json();
  return value.message;
}

async function addMessage(message) {
  const data = { message: message };
  await postJSON(data);
}

async function sendMessage() {
  let message = document.getElementById("message-box").value;
  document.getElementById("message-box").value = "";
  addMessage(message).then((_) => {
    buildChat();
  });
}

async function buildChat(limit = -1) {
  await getChatStatus().then((chatFromBack) => {
    if (limit >= 0) {
      START_POS = chatFromBack.length - limit;
      START_POS = Math.max(0, START_POS);
    }
    let chatMessagesHtml = "<ul>\n";
    let i = START_POS;
    for (i; i < chatFromBack.length; i += 1) {
      chatMessagesHtml += `<li>${chatFromBack[i]}</li>\n`;
    }
    chatMessagesHtml += "\n</ul>";
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
