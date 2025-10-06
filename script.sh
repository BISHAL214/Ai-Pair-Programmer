#!/usr/bin/env bash
set -e

# --- SCRIPT CONFIGURATION & DATA ---

# Dynamically determine the project's root directory.
PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
ORIGINAL_DIR=$(pwd)

# SINGLE SOURCE OF TRUTH for all commands.
# Format: "command:subcommand|Description|Shell command to execute"
# To add a new command, just add a new line here. Everything else updates automatically.
IFS=$'\n' COMMANDS=(
	"dev:turbo|🚀 Start the full-stack turbo server|pnpm dev"
	"dev:client|💻 Start the client dev server only|pnpm dev --filter=client"
	"dev:server|⚙️ Start the server dev server only|pnpm dev --filter=server"
	"db:studio|🗃️ Open Prisma Studio in the browser|cd ./packages/db && pnpm db:studio"
	"db:pull|🔽 Pull schema from the remote database|cd ./packages/db && pnpm db:pull"
	"db:generate|⚡ Generate the Prisma client|cd ./packages/db && pnpm db:generate"
	"db:push|🔼 Push schema changes to the database|cd ./packages/db && pnpm db:push"
	"db:drop|🔥 Drop the database (irreversible)|cd ./packages/db && pnpm db:drop"
	"worker:start:git|👷 Start the Git Extract Worker|cd ./apps/server && pnpm worker:git"
	"worker:start:container|📦 Start the Container Worker|cd ./apps/server && pnpm worker:container"
	"worker:start:file-sync|🔄 Start the File Sync Worker|cd ./apps/server && pnpm worker:file-sync"
	"worker:clear:extract|🧹 Clear the 'extract' queue|cd ./apps/server && pnpm clear:queue extract"
	"worker:clear:container|🧹 Clear the 'container' queue|cd ./apps/server && pnpm clear:queue container"
	"worker:clear:file-sync|🧹 Clear the 'file-sync' queue|cd ./apps/server && pnpm clear:queue file-sync"
)

# --- CORE FUNCTIONS ---

# A more visually appealing command runner.
run_command() {
	local title="$1" cmd="$2"
	gum style --padding "0 1" --border normal --border-foreground 57 "$title"
	if gum spin --spinner="moon" --title="Executing..." --show-output -- $SHELL -c "$cmd"; then
		gum style --border rounded --border-foreground 40 --padding "0 1" "✔ Success"
	else
		gum style --border rounded --border-foreground 196 --padding "0 1" "✖ Command Failed"
		exit 1
	fi
}

# Automatically generates a help table from the COMMANDS array.
display_help() {
	header="$(gum style --bold 'COMMAND')"
	header="$header,$(gum style --bold 'SUBCOMMAND')"
	header="$header,$(gum style --bold 'DESCRIPTION')"

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

# --- SCRIPT MODES ---

# Interactive mode, auto-generated from the COMMANDS array.
interactive_mode() {
	local choices=()
	for cmd_data in "${COMMANDS[@]}"; do
		choices+=("${cmd_data%%|*}")
	done

	CHOICE=$(gum filter "${choices[@]}" --header="Choose a command to run..." --height=15)
	[[ -z "$CHOICE" ]] && exit 0

	main "${CHOICE%%:*}" "${CHOICE#*:}"
}

# Main execution logic. Now a compact, data-driven dispatcher.
main() {
	# Change to project root if necessary.
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

			# Handle special cases that require confirmation.
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

# --- ENTRYPOINT & EXIT HANDLING ---

# Gracefully return to the original directory on script exit.
cleanup() {
	if [[ "$(pwd)" != "$ORIGINAL_DIR" ]]; then
		cd "$ORIGINAL_DIR"
	fi
}
trap cleanup EXIT

# Display a modern banner.
gum join --vertical --align center \
	"$(gum style --border double --padding '0 2' --border-foreground 57 '🚀 AI Pair Programmer CLI')" \
	"$(gum style --faint "$(date)")"
echo

# Route to the correct mode based on arguments.
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
