#!/usr/bin/env bash
set -e

# usage: ./run.sh <directory>
# example: ./run.sh apps/server

# if [ -z "$DIR" ]; then
#   gum style --foreground 196 "❌ Usage: $0 <directory>"
#   gum style --foreground 244 "   Example: ./run.sh apps/client"
#   exit 1
# fi

# Banner
gum style --border double --margin "1 2" --padding "1 2" \
  --foreground 33 "📂 Running command in Ai Powered Pair Programmer"

# Main command selection
COMMAND=$(gum choose "dev" "db" "worker" "exit")

if [ "$COMMAND" = "exit" ]; then
  gum style --foreground 244 "👋 Exiting..."
  exit 0
fi

case "$COMMAND" in
  dev)
    DEVCOMMAND=$(gum choose "turbo_dev" "client_dev" "server_dev" "exit")

    if [ "$DEVCOMMAND" = "exit" ]; then
      gum style --foreground 244 "👋 Exiting..."
      exit 0
    fi

    case "$DEVCOMMAND" in
      turbo_dev)
        gum style --foreground 84 "▶ Starting turbo development server..."
        bun dev
        ;;
      client_dev)
        gum style --foreground 82 "▶ Starting client development server..."
        bun dev --filter=client
        ;;
      server_dev)
        gum style --foreground 75 "▶ Starting server development server..."
        bun dev --filter=server
        ;;
      *)
        gum style --foreground 196 "❌ Unknown dev command: $DEVCOMMAND"
        exit 1
        ;;
    esac
    ;;

  db)
    DBCOMMAND=$(gum choose "db_studio" "db_pull" "db_generate" "db_drop" "db_check" "db_up" "db_push" "exit")

    if [ "$DBCOMMAND" = "exit" ]; then
      gum style --foreground 244 "👋 Exiting..."
      exit 0
    fi

    DBDIR=./packages/db

    case "$DBCOMMAND" in
      db_pull)
        gum style --foreground 84 "🥄 Pulling from database..."
        cd $DBDIR && bun db:pull
        ;;
      db_studio)
        gum style --foreground 30 "🎙️ Starting database studio..."
        cd $DBDIR && bun db:studio
        ;;
      db_generate)
        gum style --foreground 90 "⚡ Starting database generation..."
        cd $DBDIR && bun db:generate
        ;;
      db_drop)
        gum style --foreground 120 "❌ Dropping database..."
        cd $DBDIR && bun db:drop
        ;;
      *)
        gum style --foreground 196 "❌ Unknown db command: $DBCOMMAND"
        exit 1
        ;;
    esac
    ;;

  worker)
    WORKERCOMMAND=$(gum choose "start_worker" "clear_queue" "exit")

    if [ "$WORKERCOMMAND" = "exit" ]; then
      gum style --foreground 244 "👋 Exiting..."
      exit 0
    fi

    WORKERDIR=./apps/server

    case "$WORKERCOMMAND" in
      start_worker)
        gum style --foreground 207 "💼 Select which worker to start..."
        WORKERSTARTCOMMAND=$(gum choose "git_worker" "container_worker" "file_sync_worker" "exit")

        if [ "$WORKERSTARTCOMMAND" = "exit" ]; then
          gum style --foreground 244 "👋 Exiting..."
          exit 0
        fi

        case "$WORKERSTARTCOMMAND" in
          git_worker)
            gum style --foreground 75 "▶ Starting Git Extract Worker..."
            cd $WORKERDIR && bun worker:git
            ;;
          container_worker)
            gum style --foreground 75 "▶ Starting Container Extract Worker..."
            cd $WORKERDIR && bun worker:container
            ;;
          file_sync_worker)
            gum style --foreground 75 "▶ Starting File Sync Extract Worker..."
            cd $WORKERDIR && bun worker:file-sync
            ;;
          *)
            gum style --foreground 196 "❌ Unknown worker command: $WORKERSTARTCOMMAND"
            exit 1
            ;;
        esac
        ;;

      clear_queue)
        gum style --foreground 196 "🚽 Select which queue to clear..."
        CLEARCOMMAND=$(gum choose "extract_queue" "container_queue" "file_sync_queue" "exit")

        if [ "$CLEARCOMMAND" = "exit" ]; then
          gum style --foreground 244 "👋 Exiting..."
          exit 0
        fi

        case "$CLEARCOMMAND" in
          extract_queue)
            gum style --foreground 214 "🧹 Clearing Extract Queue..."
            cd $WORKERDIR && bun clear:queue extract
            ;;
          container_queue)
            gum style --foreground 214 "🧹 Clearing Container Queue..."
            cd $WORKERDIR && bun clear:queue container
            ;;
          file_sync_queue)
            gum style --foreground 214 "🧹 Clearing File Sync Queue..."
            cd $WORKERDIR && bun clear:queue file-sync
            ;;
          *)
            gum style --foreground 196 "❌ Unknown clear command: $CLEARCOMMAND"
            exit 1
            ;;
        esac
        ;;
      *)
        gum style --foreground 196 "❌ Unknown worker command: $WORKERCOMMAND"
        exit 1
        ;;
    esac
    ;;

  *)
    gum style --foreground 196 "❌ Unknown command: $COMMAND"
    exit 1
    ;;
esac
