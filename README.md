# MC Panel

This is my web panel for minecraft servers.

## Features

- Autostart
- Autorestart on crash
- Autosave
- Backups with upload to GCP storage bucket
- Auto download server
- Auto signs annoying eula

## Installation methods

### Docker (recommended)

- Create a directory where the data should live
- Create a docker-compose.yml file with this content

```yaml
services:
  mc-panel:
    image: ghcr.io/coderadu/mc-panel/mc-panel-{amd64,arm64}:latest # pick your architecture using uname -p (amd64 is x86_64 and arm64 is aarch64)
    volumes:
      - ./server:/server/server
      - ./config:/server/config
      - ./backups:/server/backups
    ports:
      - 1234:1234
      - 25565:25565/tcp
      - 25565:25565/udp
    stop_signal: SIGINT
    stop_grace_period: "30s"
```

- Create a config folder and a config.env file in it with this content

```conf
MEMORY_ALLOCATION=1024 #Memory allocation in MB
AUTOSAVE_INTERVAL=5 #Autosave interval in minutes (eg. 1, 5, 0.5) 0=disabled
DOWNLOAD_PAPERMC=true #Auto download papermc server
PAPERMC_DOWNLOAD_VERSION=1.20.1 #Papermc server version
PAPERMC_DOWNLOAD_BUILD=169 #Papermc server build
AUTOSTART=true #Auto start the server on host start
BACKUP_INTERVAL=0 #Backup interval (to gcp storage bucket) in minutes, 0=disabled
BACKUP_PROJECT_ID= #The project id of the storage bucket
BACKUP_STORAGE_BUCKET= #The storage bucket name that backups go to
BACKUP_FILENAME=backup-{date}.zip #{date} will be replaced automatically
BACKUP_SOURCE_DIRECTORIES=server/world,server/world_nether,server/world_the_end #comma-separated
# directories that will be included in backups
# Your credentials should go in config/service-account.json
# Your service account should have the 'Storage Object Admin' permission
```

- Change configuration as needed
- `docker compose up` or `docker-compose up` and you're good to go! 🎉

### From source

- `git clone` this repo, or download the latest zip
- Make sure you have nodejs 16 or higher installed
- Install dependencies with `npm install`
- Build the panel with `npm run build`
- Copy config/config.env.example to config/config.env and change configuration as needed
- Start the panel with `node dist/index.js` and you're good to go! 🎉
