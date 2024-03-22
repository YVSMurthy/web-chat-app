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
  const cursorPosition = message.selectionStart;
  const textBeforeCursor = message.value.substring(0, cursorPosition);
  const textAfterCursor = message.value.substring(cursorPosition);
  message.value = textBeforeCursor + emoji.native + textAfterCursor;
  message.focus();
}

function addMessage(username, message) {
  const text = document.createElement('li');
  const senderName = document.createElement('h3');
  const textMessage = document.createElement('p');
  textMessage.textContent = message;
  senderName.textContent = username;
  text.appendChild(senderName);
  text.appendChild(textMessage);
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
   // loading contacts
   const contacts = contactList.contacts
   contacts.forEach((contact) => {
      const name = document.createElement('h2')
      const phone = document.createElement('h4')
      const details = document.createElement('div')
      const unread = document.createElement('h4')
      unread.classList.add('unread-messages')
      details.classList.add('left-contact-details')
      phone.classList.add('contact-no')
      name.textContent = contact.contactName
      phone.textContent = contact.phone
      unread.textContent = contact.unread
      details.appendChild(name)
      details.appendChild(phone)
      const contact_div = document.createElement('div')
      contact_div.classList.add('contacts')
      contact_div.appendChild(details)
      contact_div.appendChild(unread)
      document.getElementById('chat-contacts').appendChild(contact_div)

      contact_div.addEventListener('click', function() {
        // selected user message display
        receiverList = []
        if (!receiverList.includes(contact.phone)) {
          unread.textContent = 0
          unread.style.opacity = 0
          receiverList.push(contact.phone)
          messageTab.style.opacity = 1
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
      name.textContent = user.contactName
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
          receiverList.push(user.phone)
          messageTab.style.opacity = 1
          document.getElementById("receiver-name").textContent = user.contactName
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