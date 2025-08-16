# MC Panel

This is my web panel for minecraft servers.

## Features

- Autostart
- Autorestart on crash
- Autosave
- Backups with upload to GCP storage bucket
- Auto download server
- Auto signs annoying eula

## Installation

- Create a directory where the data should live
- Create a docker-compose.yml file with this content

```yaml
services:
  mc-panel:
    image: ghcr.io/coderadu/mc-panel:latest
    volumes:
      - ./server:/server/server
      # Uncomment the following line if you need GCS backups
      # and put your credentials in ./config/service-account.json
      # - ./config:/server/config
      - ./backups:/server/backups
    ports:
      - 1234:1234 # Please do not expose this port to the public web, this is the web panel
      - 25565:25565/tcp # Change server port as needed
    stop_signal: SIGINT
    stop_grace_period: '30s'
    environment:
      - MEMORY_ALLOCATION=1024 # Memory allocation in MB
      - AUTOSAVE_INTERVAL=5 # Autosave interval in minutes (eg. 1, 5, 0.5) 0=disabled
      - AUTOSTART=true # Automatically start the server when the container starts
      - BACKUP_INTERVAL=0 # Backup interval (to gcp storage bucket) in minutes, 0=disabled
      - BACKUP_PROJECT_ID= # The project id of the storage bucket
      - BACKUP_STORAGE_BUCKET= # The storage bucket name that backups go to
      - BACKUP_FILENAME=backup-{date}.zip # {date} will be replaced automatically
      - BACKUP_SOURCE_DIRECTORIES=server/world,server/world_nether,server/world_the_end # Comma separated list of folders that should be backed up
```

- Change environment variables as needed
- `docker compose up` or `docker-compose up` and you're good to go! 🎉