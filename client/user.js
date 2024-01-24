let COOKIE_USERNAME = 'username';

export function setupUser() {
  let user = getUsernameCookie();
  updateUser(user);
  const userForm = document.getElementById("user-form")

  if (userForm !== null) {
    userForm.addEventListener("submit", function(e) {
      e.preventDefault()
      const formData = new FormData(e.target);
      const formObj = Object.fromEntries(formData);
      updateUser(formObj.name);
      window.location.href = window.location.href + 'chat-rooms';
    })
  }
}

function setUsernameCookie(username) {
  document.cookie = `username=${username}; SameSite=Lax; path=/`;
}

export function getUsernameCookie() {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_USERNAME}=`))
    ?.split("=")[1];

  return value ?? '';
}

export function updateUser(username) {
  setUsernameCookie(username);
  const userNameValue = document.getElementById("username-value");
  if (userNameValue !== null) {
    userNameValue.innerHTML = username;
  }
}

setupUser();
