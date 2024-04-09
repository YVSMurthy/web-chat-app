const socket = io();

const sendButton = document.getElementById('send-message-button')
const message = document.getElementById('message');
const messageArea = document.getElementById('message-area');
const messageTab = document.querySelector('.right')
messageTab.style.opacity = 0
var receiverList = []

function toggleRight() {
  document.getElementById('user-search').value=''
  document.getElementById("search-results").innerHTML = ''
  document.getElementById("search-results").style.display = 'none'
  document.getElementById("chat-contacts").style.display = 'block' 
}

function searchUser() {
  const username = document.getElementById('user-search').value
  if (username) {
    document.getElementById("search-results").style.display = 'block'
    document.getElementById("chat-contacts").style.display = 'none' 
    socket.emit('find user', username)
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const pickerOptions = { onEmojiSelect: addEmojiToMessage }
  const picker = new EmojiMart.Picker(pickerOptions)
  picker.classList.add('picker')
  document.querySelector('#emoji-picker').appendChild(picker)

  document.querySelector('#emoji-button').addEventListener('click', function() {
    picker.style.opacity = (picker.style.opacity == 1 ? 0 : 1)
  })

});

function addEmojiToMessage(emoji) {
  const picker = document.querySelector('.picker')
  if (picker.style.opacity == 1) {
    const cursorPosition = message.selectionStart;
    const textBeforeCursor = message.value.substring(0, cursorPosition);
    const textAfterCursor = message.value.substring(cursorPosition);
    message.value = textBeforeCursor + emoji.native + textAfterCursor;
    message.focus();
    picker.style.opacity = 0;
  }
}

function addMessage(username, message) {
  const text = document.createElement('li');
  // const senderName = document.createElement('h3');
  const textMessage = document.createElement('p');
  textMessage.textContent = message;
  // senderName.textContent = username;
  // text.appendChild(senderName);
  text.appendChild(textMessage);

  // message css based on the sender
  if (document.getElementById("receiver-name").textContent != username) {
    text.classList.add('messages_right')
  }
  else {
    text.classList.add('messages_left')
  }

  messageArea.appendChild(text);
  messageArea.scrollTop = messageArea.scrollHeight
}

sendButton.addEventListener('click', (e) => {
  e.preventDefault();
  if (message.value) {
    socket.emit('new message', message.value, receiverList);
    message.value='';
  }
});

socket.on('userLoggedIn', (contactList) => {
   document.getElementById('chat-contacts').innerHTML = ''
   const dp_colors = ["rgb(255, 174, 187)", "rgb(251, 187, 161)", "rgb(255, 234, 141)", "rgb(149, 255, 141)", "rgb(141, 230, 255)"]
   const dp_borders = ["rgb(255, 54, 87)", "rgb(255, 119, 65)", "rgb(255, 208, 0)", "rgb(0, 172, 60)", "rgb(0, 200, 255)"]
   // loading contacts
   const contacts = contactList.contacts
   contacts.forEach((contact) => {
      var colorIndex = Math.floor(Math.random() * 5);
      const name = document.createElement('h2')
      const phone = document.createElement('h4')
      const details = document.createElement('div')
      const unread = document.createElement('h4')
      const dp = document.createElement('p')
      dp.classList.add('dp')
      unread.classList.add('unread-messages')
      details.classList.add('left-contact-details')
      phone.classList.add('contact-no')
      dp.textContent = contact.contactName[0]
      name.textContent = contact.contactName
      phone.textContent = contact.phone
      unread.textContent = contact.unread
      unread.style.opacity = (contact.unread == 0)?0:1
      details.appendChild(name)
      details.appendChild(phone)
      const contact_div = document.createElement('div')
      contact_div.classList.add('contacts')
      contact_div.appendChild(dp)
      contact_div.appendChild(details)
      contact_div.appendChild(unread)
      document.getElementById('chat-contacts').appendChild(contact_div)

      dp.style.backgroundColor = dp_colors[colorIndex]
      dp.style.borderColor = dp_borders[colorIndex]
      const currDP = document.querySelector('.curr_chat_dp')
      currDP.style.backgroundColor = dp_colors[colorIndex]
      currDP.style.borderColor = dp_borders[colorIndex]

      contact_div.addEventListener('click', function() {
        // selected user message display
        receiverList = []
        if (!receiverList.includes(contact.phone)) {
          unread.textContent = 0
          unread.style.opacity = 0
          receiverList.push(contact.phone)
          messageTab.style.opacity = 1
          const currDP = document.querySelector('.curr_chat_dp')
          currDP.textContent = contact.contactName[0]
          currDP.style.backgroundColor = dp_colors[colorIndex]
          currDP.style.borderColor = dp_borders[colorIndex]
          document.getElementById("receiver-name").textContent = contact.contactName
          document.getElementById("receiver-no").textContent = contact.phone
          socket.emit('load messages', receiverList)
        }
        
      });
    })
});


socket.on('new message', (chat) => {
  console.log(chat)
  const currChat = Number(document.getElementById("receiver-no").textContent)
  if (chat.participants.includes(currChat)) {
    addMessage(chat.username, chat.message)
  }
  else {
    const contacts = document.querySelectorAll(".contacts")
    console.log(contacts)
    for (let i = 0; i < contacts.length; i++) {
      let contact_no = Number((contacts[i].querySelector('.left-contact-details')).querySelector('.contact-no').textContent)
      let undreadMessages = contacts[i].querySelector('.unread-messages')
      if (chat.participants.includes(contact_no)) {
        undreadMessages.textContent = Number(undreadMessages.textContent) + 1
        undreadMessages.style.opacity = 1
        socket.emit('inc unread message', contact_no)
      }
    }
  }
  
});

socket.on('load messages', (chats) => {
  messageArea.innerHTML = ''
  if (chats) {
    chats.forEach((chat) => {
      addMessage(chat.sender, chat.message)
    })
  }
  
})

socket.on('user matches', (users) => {
  if (users) {
    users.forEach((user) => {
      const name = document.createElement('h3')
      const phone = document.createElement('h4')
      name.textContent = user.firstName
      phone.textContent = user.phone
      const div = document.createElement('div')
      div.classList.add('search-user-details')
      div.appendChild(name)
      div.appendChild(phone)
      document.getElementById('search-results').appendChild(div)

      div.addEventListener('click', function() {
        // selected user message display
        receiverList = []
        if (!receiverList.includes(user.phone)) {
          receiverList.push(Number(user.phone))
          messageTab.style.opacity = 1
          document.getElementById("search-results").innerHTML = ''
          document.getElementById("search-results").style.display = 'none'
          document.getElementById('user-search').value=''
          document.getElementById("chat-contacts").style.display = 'block'
          document.querySelector('.curr_chat_dp').textContent = user.firstName[0]
          document.getElementById("receiver-name").textContent = user.firstName
          document.getElementById("receiver-no").textContent = user.phone
          socket.emit('load messages', receiverList)
        }
        
      });
    })
  } 
  else {
    alert("No user found")
  }
})