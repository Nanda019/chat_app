const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
// const $sendLocationButton = document.querySelector('#send-location')
const $messages=document.getElementById('messages')

// Templates
const messageTemplate=document.getElementById('message-template').innerHTML
const locationmessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true})

//for autoscrolling to the bottom
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = ($messages.scrollTop + visibleHeight)+10   //add 10 prevent autoscroll when scrolled up
    if ((containerHeight - newMessageHeight) < scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message) => {
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        msg : message.text,
        createdAt : moment(message.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('location-message',(loc)=>{
    console.log(loc)
    const html=Mustache.render(locationmessageTemplate,{
        username:loc.username,
        url:loc.url,
        // createdAt:loc.createdAt
        createdAt:moment(loc.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room:room,
        userforsidebar:users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value  //by using the 'name' attribute of the form

    // socket.emit('sendMessage', message)

    //with events acknowledgement
    socket.emit('sendMessage', message, (callback) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (callback) {
            return console.log(callback)
        }

        console.log('Message delivered!')
    })
})

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Your browser is not supported to share your location')
    }

    // $sendLocationButton.setAttribute('disabled', 'disabled')

    // navigator.geolocation.getCurrentPosition((position)=>{
    //     console.log(position)
    //     // socket.emit('location',`latitude=${position.coords.latitude} longitude=${position.coords.longitude}`)
    //     socket.emit('location',`https://google.com/maps?q${position.coords.latitude},${position.coords.longitude}`)
    // })

    //with events acknowledgement
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        socket.emit('sendLocation', `https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`, () => {
            // $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})


socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})









// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//      socket.emit('increment')
// })