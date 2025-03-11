#!/bin/bash
# Create temporary directory
TMPDIR=$(mktemp -d /tmp/myapp.XXXXXX)

# Determine where the embedded archive starts
SCRIPT_LINES=$(awk '/^__ARCHIVE_BELOW__/ {print NR + 1; exit 0; }' "$0")

# Extract the archive (assuming it's a zip file)
tail -n +${SCRIPT_LINES} "$0" > "$TMPDIR/assets.zip"

# Unzip the assets
unzip -o "$TMPDIR/assets.zip" -d "$TMPDIR"

# Detect the operating system and set the appropriate environment variable for dynamic libraries
OS_TYPE=$(uname)
if [ "$OS_TYPE" = "Darwin" ]; then
    # macOS uses DYLD_LIBRARY_PATH
    export DYLD_LIBRARY_PATH="$TMPDIR/pkg/libs:$DYLD_LIBRARY_PATH"
elif [ "$OS_TYPE" = "Linux" ]; then
    # Linux uses LD_LIBRARY_PATH
    export LD_LIBRARY_PATH="$TMPDIR/pkg/libs:$LD_LIBRARY_PATH"
elif [[ "$OS_TYPE" == *"MINGW"* ]] || [[ "$OS_TYPE" == *"CYGWIN"* ]]; then
    # Windows environments (Git Bash/Cygwin) use PATH for DLL lookup
    export PATH="$TMPDIR/pkg/libs:$PATH"
fi

# Execute the main binary (adjust the path/name if needed per OS)
"$TMPDIR"/pkg/agents-fun-linux

# Clean up the temporary directory if needed
# rm -rf "$TMPDIR"

exit 0

__ARCHIVE_BELOW__
