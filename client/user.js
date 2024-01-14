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
    })
  }
}

function setUsernameCookie(username) {
  document.cookie = `username=${username}; SameSite=None; Secure; path=/`;
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
  document.getElementById("username-value").innerHTML = username;
}

// document.getElementById("user-form").addEventListener("submit", function(e) {
//   e.preventDefault()
//   const formData = new FormData(e.target);
//   const formObj = Object.fromEntries(formData);
//   updateUser(formObj.name);
// })
//

setupUser();
