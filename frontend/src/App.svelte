<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'

  function startServer() {}
  function stopServer() {}
  function shutDown() {}
  function sendCmd() {}
</script>

<div class="container">
  <h3>MC Panel</h3>
  <div class="buttons">
    <button
      on:click={startServer}
      class="waves-effect waves-light btn"
      id="start"
    >
      Start
    </button>
    <button
      on:click={stopServer}
      class="waves-effect waves-light btn"
      id="stop"
    >
      Stop
    </button>
    <button on:click={shutDown} class="waves-effect waves-light btn">
      Shut Down Host
    </button>
  </div>
  <div class="terminal" />
  <div class="command">
    <input type="text" placeholder="Command" id="cmdIn" />
    <button on:click={shutDown} class="waves-effect waves-light btn">
      Send
    </button>
  </div>
</div>
