<script lang="ts">
  import { Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'
  import { io } from './lib/socketio'
  import { onMount } from 'svelte'
  import 'xterm/css/xterm.css'
  let terminal: HTMLDivElement
  let start: HTMLButtonElement
  let stop: HTMLButtonElement

  const term = new Terminal({
    theme: {
      background: '#333333',
      foreground: '#dddddd',
      cursor: '#aaaaaa',
    },
  })
  const fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  onMount(() => {
    term.open(terminal)
    fitAddon.fit()
    term.onData((e) => {
      io.emit('write', e)
    })
  })

  io.on('send-logs', (log) => {
    console.log(log)
    term.write(log)
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
    term.write('Disconnected from host \r\n')
  })

  function stopServer() {
    io.emit('stop-server')
  }

  function startServer() {
    io.emit('start-server')
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
  </div>
  <div bind:this={terminal} />
</div>
