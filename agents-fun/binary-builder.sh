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
CPU_TYPE=$(uname -m)
echo "OS_TYPE: $OS_TYPE"
echo "CPU_TYPE: $CPU_TYPE"
if [ "$OS_TYPE" = "Darwin" ]; then
    # macOS uses DYLD_LIBRARY_PATH
    if [ "$CPU_TYPE" = "arm64" ]; then
        export DYLD_LIBRARY_PATH="$TMPDIR/pkg_darwin_arm64/libs:$DYLD_LIBRARY_PATH"
    else
        export DYLD_LIBRARY_PATH="$TMPDIR/pkg_darwin_x64/libs:$DYLD_LIBRARY_PATH"
    fi
elif [ "$OS_TYPE" = "Linux" ]; then
    # Linux uses LD_LIBRARY_PATH
    if [ "$CPU_TYPE" = "x86_64" ]; then
        export LD_LIBRARY_PATH="$TMPDIR/pkg_linux_x64/libs:$LD_LIBRARY_PATH"
    else
        export LD_LIBRARY_PATH="$TMPDIR/pkg_linux_arm64/libs:$LD_LIBRARY_PATH"
    fi
elif [[ "$OS_TYPE" == *"MINGW"* ]] || [[ "$OS_TYPE" == *"CYGWIN"* ]]; then
    # Windows environments (Git Bash/Cygwin) use PATH for DLL lookup
    if [ "$CPU_TYPE" = "x86_64" ]; then
        export PATH="$TMPDIR/pkg_win_x64/libs:$PATH"
    else
        export PATH="$TMPDIR/pkg_win_arm64/libs:$PATH"
    fi
fi

# Execute the main binary (adjust the path/name if needed per OS)
if [ "$OS_TYPE" = "Linux" ]; then
    if ["$CPU_TYPE" = "x86_64"]; then
        "$TMPDIR"/pkg_linux_x64/agents-fun-linux
    else
        "$TMPDIR"/pkg_linux_arm64/agents-fun-linux
    fi
elif [ "$OS_TYPE" = "Darwin" ]; then
    if [ "$CPU_TYPE" = "arm64" ]; then
        "$TMPDIR"/pkg_darwin_arm64/agents-fun-macos
    else
        "$TMPDIR"/pkg_darwin_x64/agents-fun-macos
    fi
elif [[ "$OS_TYPE" == *"MINGW"* ]] || [[ "$OS_TYPE" == *"CYGWIN"* ]]; then
    if [ "$CPU_TYPE" = "x86_64" ]; then
        "$TMPDIR"/pkg_win_x64/agents-fun-win.exe
    else
        "$TMPDIR"/pkg_win_arm64/agents-fun-win.exe
    fi
fi

exit 0

__ARCHIVE_BELOW__
