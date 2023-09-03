module.exports = {
  apps: [
    {
      name: 'MC Panel',
      script: './server.js',
      kill_timeout: 60000,
      watch: ['server.js'],
    },
  ],
}
