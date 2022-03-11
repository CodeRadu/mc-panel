const socket=io()
const content=document.querySelector('.terminal')
const cmd=document.querySelector('#cmdIn')

let logs=''
setInterval(()=>{
  socket.emit('get-logs')
}, 1000)

socket.on('send-logs', log=>{
  if(log!=logs){
    content.innerText=log
    content.scrollTo(0, content.scrollHeight)
    logs=log
  }
})

socket.on('disconnect', ()=>{
  content.innerText='Disconnected from host'
})

function stopServer(){
  socket.emit('stop-server')
}

function startServer(){
  socket.emit('start-server')
}

function sendCmd(){
  if(!cmd.value)return
  socket.emit('send-cmd', cmd.value)
  cmd.value=''
}

function shutDown(){
  socket.emit('shut-down')
}