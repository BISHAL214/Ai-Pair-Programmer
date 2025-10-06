#!/usr/bin/env bash
set -e

# --- SCRIPT CONFIGURATION & DATA ---

PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
ORIGINAL_DIR=$(pwd)

IFS=$'\n' COMMANDS=(
	"dev:turbo|🚀 Starting the full-stack turbo server -- (development)|doppler run -- bun dev"
	"dev:client|💻 Starting NextJs Client -- (development)|doppler run -- bun dev --filter=client"
	"dev:server|⚙️ Starting the HonoJs Server -- (development)|doppler run -- bun dev --filter=server"
	"db:studio|🗃️ Opening Prisma Studio in the browser|cd ./packages/db && doppler run -- bun db:studio"
	"db:pull|🔽 Pulling schema from the remote database|cd ./packages/db && doppler run -- bun db:pull"
	"db:generate|⚡ Generating the Prisma client|cd ./packages/db && doppler run -- bun db:generate"
	"db:push|🔼 Pushing schema changes to the database|cd ./packages/db && doppler run -- bun db:push"
	"db:drop|🔥 Dropping the database (irreversible)|cd ./packages/db && doppler run -- bun db:drop"
	"worker:start:git|👷 Starting the Git Extract Worker|cd ./apps/server && doppler run -- bun worker:git"
	"worker:start:container|📦 Starting the Container Worker|cd ./apps/server && doppler run -- bun worker:container"
	"worker:start:file-sync|🔄 Starting the File Sync Worker|cd ./apps/server && doppler run -- bun worker:file-sync"
	"worker:clear:extract|🧹 Clearing the 'extract' queue|cd ./apps/server && doppler run -- bun clear:queue extract"
	"worker:clear:container|🧹 Clearing the 'container' queue|cd ./apps/server && doppler run -- bun clear:queue container"
	"worker:clear:file-sync|🧹 Clearing the 'file-sync' queue|cd ./apps/server && doppler run -- bun clear:queue file-sync"
)

# --- CORE FUNCTIONS ---

# A smarter command runner: auto-detect long-running commands and stream logs directly.
run_command() {
	local title="$1" cmd="$2"

	gum style --padding "0 1" --border normal --border-foreground 57 "$title"

	# Detect long-running/dev commands — skip spinner for these
	if [[ "$cmd" == *"bun dev"* || "$cmd" == *"worker"* || "$cmd" == *"studio"* ]]; then
		echo
		gum style --faint "📡 Streaming logs (live mode)..."
		echo "──────────────────────────────────────────────"
		# Directly stream logs with colors preserved
		eval "$cmd"
		status=$?
	else
		# For short commands, keep spinner for clean UX
		if gum spin --spinner="moon" --title="Executing..." --show-output -- $SHELL -c "$cmd"; then
			status=0
		else
			status=1
		fi
	fi

	echo "──────────────────────────────────────────────"

	if [[ $status -eq 0 ]]; then
		gum style --border rounded --border-foreground 40 --padding "0 1" "✔ Success"
	else
		gum style --border rounded --border-foreground 196 --padding "0 1" "✖ Command Failed"
		exit 1
	fi
}

# Automatically generates a help table
display_help() {
	header="$(gum style --bold 'COMMAND'),$(gum style --bold 'SUBCOMMAND'),$(gum style --bold 'DESCRIPTION')"

	(
		echo "$header"
		for cmd_data in "${COMMANDS[@]}"; do
			IFS=':' read -r cmd sub <<<"${cmd_data%%|*}"
			desc="${cmd_data#*|}"
			desc="${desc%|*}"
			printf "%s,%s,%s\n" "$cmd" "$sub" "$desc"
		done
	) | gum table --separator "," --columns "COMMAND","SUBCOMMAND","DESCRIPTION" --widths 10,20,0
}

# Interactive menu
interactive_mode() {
	local choices=()
	for cmd_data in "${COMMANDS[@]}"; do
		choices+=("${cmd_data%%|*}")
	done

	CHOICE=$(gum filter "${choices[@]}" --header="Choose a command to run..." --height=15)
	[[ -z "$CHOICE" ]] && exit 0

	main "${CHOICE%%:*}" "${CHOICE#*:}"
}

main() {
	if [[ "$(pwd)" != "$PROJECT_ROOT" ]]; then
		cd "$PROJECT_ROOT"
		gum log --level info --structured "Switched to project root"
	fi

	local target_cmd="$1:$2" command_found=false

	for cmd_data in "${COMMANDS[@]}"; do
		if [[ "${cmd_data%%|*}" == "$target_cmd" ]]; then
			command_found=true
			desc_and_exec="${cmd_data#*|}"
			desc="${desc_and_exec%|*}"
			exec_cmd="${desc_and_exec##*|}"

			case "$target_cmd" in
			db:drop | worker:clear:*)
				prompt_text="$(gum style --bold --foreground 214 "$desc?")"
				if gum confirm "$prompt_text"; then
					run_command "$desc" "$exec_cmd"
				else
					gum style --faint "Action cancelled."
				fi
				;;
			*)
				run_command "$desc" "$exec_cmd"
				;;
			esac
			break
		fi
	done

	if ! $command_found; then
		gum log --level error "Unknown command: $1 $2"
		display_help
		exit 1
	fi
}

cleanup() {
	if [[ "$(pwd)" != "$ORIGINAL_DIR" ]]; then
		cd "$ORIGINAL_DIR"
	fi
}
trap cleanup EXIT

# Banner
gum join --vertical --align center \
	"$(gum style --border double --padding '0 2' --border-foreground 57 '🚀 AI Pair Programmer CLI')" \
	"$(gum style --faint "$(date)")"
echo

# Entry
case "$1" in
"" | -i | --interactive)
	interactive_mode
	;;
help | -h | --help)
	display_help
	;;
*)
	main "$@"
	;;
esac
