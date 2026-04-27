const socket = io("https://chat-app-fm60.onrender.com");

const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");

const activity = document.querySelector(".activity");
const usersList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");

function sendMessage(e) {
  e.preventDefault();

  if (nameInput.value && msgInput.value && chatRoom.value) {
    socket.emit("message", {
      name: nameInput.value,
      text: msgInput.value,
    });
    msgInput.value = "";
  }
  msgInput.focus();
}

function enterRoom(e) {
  e.preventDefault();

  if (nameInput.value && chatRoom.value) {
    socket.emit("enterRoom", {
      name: nameInput.value,
      room: chatRoom.value,
    });
  }
}

document.querySelector(".form-msg").addEventListener("submit", sendMessage);

document.querySelector(".form-join").addEventListener("submit", enterRoom);

msgInput.addEventListener("keypress", () => {
  socket.emit("activity", nameInput.value);
});

// listen for message events from the server
socket.on("message", (data) => {
  activity.textContent = "";
  const { name, text, time } = data;

  const li = document.createElement("li");
  li.className = "post";

  if (name === nameInput.value) {
    li.className = "post post--left";
  }

  if (name !== nameInput.value && name !== "Admin") {
    li.className = "post post--right";
  }

  if (name !== "Admin") {
    li.innerHTML = `
          <div class="post__header ${name === nameInput.value ? "post__header--user" : "post__header--reply"}" style="margin-bottom:2px;">
            <span class="post__header--name">${name}</span>
          </div>

          <div style="font-size:0.7rem; opacity:0.7; margin-bottom:4px;">
            ${time}
          </div>

          <div class="post__text">
            ${text}
          </div>
        `;
  } else {
    li.innerHTML = `<div class="post__text">${text}</div>`;
  }

  document.querySelector(".chat-display").appendChild(li);

  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

let activityTimer;

// listen for activity event
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing...`;

  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 3000);
});

socket.on("userList", ({ users }) => {
  showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
  showRooms(rooms);
});

function showUsers(users) {
  usersList.textContent = "";

  if (users) {
    usersList.innerHTML = `<em>Users in ${chatRoom.value}: </em>`;
    users.forEach((user, index) => {
      usersList.textContent += ` ${user.name}`;
      if (users.length > 1 && index !== users.length - 1) {
        usersList.textContent += ",";
      }
    });
  }
}

function showRooms(rooms) {
  roomList.textContent = "";

  if (rooms) {
    roomList.innerHTML = `<em>Active Rooms: </em>`;
    rooms.forEach((room, index) => {
      roomList.textContent += ` ${room}`;
      if (rooms.length > 1 && index !== rooms.length - 1) {
        roomList.textContent += ",";
      }
    });
  }
}

// theme switch
function setTheme(themeName) {
  document.body.className = ""; // clear all themes
  if (themeName) {
    document.body.classList.add(themeName);
  }

  localStorage.setItem("theme", themeName);
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  document.body.classList.add(savedTheme);
}
