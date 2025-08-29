# Building Binaries for Eliza Agents

This document explains how to build binary executables for Eliza agents using the `agents-fun-eliza` project as an example. The process leverages GitHub Actions for cross-platform binary creation, but the same principles can be applied to local builds.

## Overview

The [`.github/workflows/binary_builder.yaml`](../.github/workflows/binary_builder.yaml) workflow demonstrates how to build standalone binary executables for Eliza agents across multiple platforms (Linux, macOS, Windows) and architectures (x64, arm64). This allows agents to be distributed and run without requiring users to install Node.js or other dependencies.

## Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/installation)
- [Bun 1.2.4+](https://bun.sh/) for binary compilation
- [Rust/Cargo](https://www.rust-lang.org/tools/install) for additional build tools
- The native dependencies required by the agent:
  - Sharp
  - onnxruntime-node
  - @roamhq/wrtc
  - sqlite-vec

## Important Note on Native Modules

All the modules listed as external dependencies (`sharp`, `onnxruntime-node`, `@roamhq`, `sqlite-vec`) caused binarization issues when compiled directly with the `agents-fun` project. These native modules rely on platform-specific binaries and C++ bindings that cannot be properly bundled into a single executable through the standard compilation process.

Instead, these dependencies are provided as external modules to be resolved during runtime. This approach allows the binary to load the appropriate native code for each platform when executed, rather than trying to embed it during compilation.

## Build Process

Here's a step-by-step guide for building Eliza agent binaries:

### 1. Set up your project structure

Your project should follow a structure similar to:
```
/your-agent-project/
  ├── agent-source/        # Your Eliza agent code
  │   ├── src/
  │   ├── characters/
  │   ├── package.json
  │   └── ...
  └── binary-builder/      # Binary packaging tools
      ├── pkg/
      │   ├── binary/      # Output folder for compiled binaries
      │   ├── characters/  # Character definitions
      │   └── package.json # Dependencies for the binary
      └── ...
```

### 2. Define binary dependencies

In your `binary-builder/pkg/package.json`, list all native dependencies as "trustedDependencies":

```json
{
  "trustedDependencies": [
    "@roamhq/wrtc",
    "onnxruntime-node",
    "sharp"
  ],
  "dependencies": {
    "@roamhq/wrtc": "0.8.0",
    "onnxruntime-node": "1.15.1",
    "sharp": "0.33.5",
    "sqlite-vec": "0.1.6"
  }
}
```

### 3. Build process for local development

To build your agent binaries locally:

```bash
# Install dependencies
cd agent-source
pnpm install --frozen-lockfile

# Create a directory for the compiled binary
mkdir -p ./pkg_$(uname | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/x64/' | sed 's/aarch64/arm64/')/libs/

# Compile with Bun, marking problematic native modules as external
bun build --compile ./src/index.ts \
  --outfile=pkg_$(uname | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/x64/' | sed 's/aarch64/arm64/')/agent_runner \
  --external sharp --external onnxruntime-node --external @roamhq --external sqlite-vec

# Copy binary to the binary-builder package
cp ./pkg_$(uname | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/x64/' | sed 's/aarch64/arm64/')/agent_runner ../binary-builder/pkg/binary/

# Install binary dependencies
cd ../binary-builder/pkg
npm install

# Build the final package
cd ..
cargo build --release
```

### 4. Using GitHub Actions

For automated cross-platform builds, set up a workflow similar to the `.github/workflows/binary_builder.yaml`:

1. Define a matrix of OS and architecture combinations
2. Set up necessary tools (Node.js, pnpm, Bun)
3. Install dependencies
4. Create output directories
5. Build binaries with Bun, excluding native modules
6. Install native dependencies alongside the binary
7. Build the final packaged binary
8. Upload the artifacts

## Technical Details

### Native Modules

The `--external` flag in the Bun build command excludes the following native dependencies from compilation due to binarization issues:
- `sharp` - Image processing library with native libvips dependencies
- `onnxruntime-node` - Machine learning runtime with platform-specific binaries
- `@roamhq/wrtc` - WebRTC implementation with native C++ bindings
- `sqlite-vec` - Vector database for SQLite with platform-specific extensions

These dependencies are installed separately alongside the binary to be loaded at runtime rather than being embedded in the executable itself, which prevents compatibility issues across platforms.

### Character Definitions

Make sure to include character files (like `eliza.character.json`) in your binary package to define agent personality, capabilities, and behavior.

### Running the Binary

The compiled binary can be run directly on supported platforms without requiring Node.js or other dependencies:

```bash
# Linux/macOS
./agent_runner --character=characters/eliza.character.json

# Windows
agent_runner.exe --character=characters/eliza.character.json
```

## Troubleshooting

- If you encounter errors with native modules, make sure they are correctly defined as external and installed in the binary package
- For architecture-specific issues, ensure you're using the correct binary for your platform
- Check that all required character files and assets are included in the binary package
- If you see "Module not found" errors at runtime, verify that the external dependencies are properly installed in the same directory structure expected by the binary