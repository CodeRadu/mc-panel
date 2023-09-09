<script lang="ts">
  import { io } from './lib/socketio'
  let terminal: HTMLDivElement
  let cmd: HTMLInputElement
  let start: HTMLButtonElement
  let stop: HTMLButtonElement

  let logs = ''

  io.on('send-logs', (log) => {
    if (log != logs) {
      terminal.innerText = log
      terminal.scrollTo(0, terminal.scrollHeight)
      logs = log
    }
  })

  io.on('enable-start', () => {
    start.disabled = false
  })

  io.on('disable-start', () => {
    start.disabled = true
  })

  io.on('enable-stop', () => {
    stop.disabled = false
  })

  io.on('disable-stop', () => {
    stop.disabled = true
  })

  io.on('disconnect', () => {
    terminal.innerText = 'Disconnected from host'
  })

  function stopServer() {
    io.emit('stop-server')
  }

  function startServer() {
    io.emit('start-server')
  }

  function sendCmd() {
    if (!cmd.value) return
    io.emit('send-cmd', cmd.value)
    cmd.value = ''
  }

  function shutDown() {
    io.emit('shut-down')
  }
</script>

<div class="container">
  <h3>MC Panel</h3>
  <div class="buttons">
    <button
      on:click={startServer}
      class="waves-effect waves-light btn"
      id="start"
      bind:this={start}
    >
      Start
    </button>
    <button
      on:click={stopServer}
      class="waves-effect waves-light btn"
      id="stop"
      bind:this={stop}
    >
      Stop
    </button>
    <button on:click={shutDown} class="waves-effect waves-light btn">
      Shut Down Host
    </button>
  </div>
  <div class="terminal" bind:this={terminal} />
  <div class="command">
    <input type="text" placeholder="Command" bind:this={cmd} />
    <button on:click={sendCmd} class="waves-effect waves-light btn">
      Send
    </button>
  </div>
</div>
