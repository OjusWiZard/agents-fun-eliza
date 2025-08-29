# Release Creator Workflow

This document provides detailed information about the Release Creator workflow, which is responsible for creating GitHub releases with the binary artifacts produced by the Binary Builder workflow.

## Table of Contents

- [Overview](#overview)
- [Trigger Conditions](#trigger-conditions)
- [Permissions](#permissions)
- [Jobs and Steps](#jobs-and-steps)
- [Artifact Management](#artifact-management)
- [Release Creation](#release-creation)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

## Overview

The Release Creator workflow (`release_creator.yaml`) is responsible for creating GitHub releases with the binary artifacts produced by the Binary Builder workflow. It runs after the Binary Builder workflow completes successfully on the main branch, downloading the binary artifacts and creating a new GitHub release with those artifacts.

### Purpose and Goals

- Create GitHub releases for successful builds on the main branch
- Attach binary artifacts to the release
- Generate release notes with information about the release
- Provide a consistent release process for the project

## Trigger Conditions

The workflow is triggered under the following conditions:

```yaml
on:
  workflow_run:
    workflows: ["Build and Package Agents-Fun"]
    types:
      - completed
    branches:
      - main
  workflow_dispatch:  # Allow manual triggering
```

- **After Binary Builder**: Automatically triggered when the "Build and Package Agents-Fun" workflow completes on the main branch
- **Manual Trigger**: Can be manually triggered through the GitHub Actions interface

## Permissions

The workflow requires specific permissions to create releases:

```yaml
permissions:
  contents: write  # Required to create releases
  actions: read    # Required to access workflow artifacts
```

These permissions follow the principle of least privilege while still allowing the workflow to create releases and access artifacts.

## Jobs and Steps

The workflow consists of a single job called `create-release` that runs on Ubuntu.

### Create Release Job

The create-release job performs the following steps:

1. **Checkout Repository**: Clones the repository with a shallow depth for faster checkout
2. **Get Package Version**: Extracts the version from package.json
3. **Log Workflow Information**: Logs information about the triggering workflow
4. **Download Artifacts**: Downloads artifacts from the Binary Builder workflow
5. **Check Artifacts**: Verifies that artifacts were successfully downloaded
6. **Prepare Artifacts**: Organizes artifacts for the release
7. **Create GitHub Release**: Creates a GitHub release with the artifacts
8. **Handle Missing Artifacts**: Provides error information if artifacts are missing

## Artifact Management

The workflow downloads artifacts from the Binary Builder workflow using the `actions/download-artifact` action:

```yaml
- name: Download artifacts from triggering workflow
  uses: actions/download-artifact@c850b930e6ba138125429b7e5c93fc707a7f8427 # v4.1.4
  id: download
  with:
    # Use GITHUB_TOKEN with minimal permissions
    github-token: ${{ github.token }}
    run-id: ${{ github.event.workflow_run.id }}
    path: ./release_assets
    merge-multiple: true
  continue-on-error: true
```

It then prepares these artifacts for the release:

```yaml
- name: Prepare artifacts for release
  if: steps.check_artifacts.outputs.artifacts_exist == 'true'
  run: |
    # Create a flat structure for all artifacts
    mkdir -p ./release_files
    
    # Find all binary artifacts and copy them to release_files
    find ./release_assets -type f -name "agent_runner_*" -exec cp {} ./release_files/ \;
    
    echo "Artifacts prepared for release:"
    ls -la ./release_files/
```

## Release Creation

The workflow creates a GitHub release using the `softprops/action-gh-release` action:

```yaml
- name: Create GitHub Release
  if: steps.check_artifacts.outputs.artifacts_exist == 'true'
  # Pin action with SHA for security
  uses: softprops/action-gh-release@9d7c94cfd0a1f3ed45544c887983e9fa900f0564 # v2.0.4
  with:
    tag_name: v${{ steps.package_version.outputs.version }}
    name: Release v${{ steps.package_version.outputs.version }}
    files: ./release_files/*
    fail_on_unmatched_files: false
    draft: false
    prerelease: false
    generate_release_notes: true
    body: |
      ## Release v${{ steps.package_version.outputs.version }}
      
      This release contains ${{ steps.check_artifacts.outputs.artifact_count }} binary artifacts.
      
      ### Supported platforms:
      - Linux (x64, arm64)
      - macOS (x64, arm64)
      - Windows (x64)
      
      ### Installation
      Download the appropriate binary for your platform and follow the instructions in the [documentation](docs/binary_building.md).
```

The release includes:
- A version tag based on package.json
- A release name
- All binary artifacts
- Automatically generated release notes
- A custom body with information about the release

## Common Issues and Troubleshooting

### Missing Artifacts

If artifacts are missing, the workflow provides detailed error information:

```yaml
- name: Handle missing artifacts
  if: steps.check_artifacts.outputs.artifacts_exist == 'false'
  run: |
    echo "::error::No artifacts were found from the binary_builder workflow!"
    echo "This could be due to:"
    echo "1. Artifacts expired (GitHub stores artifacts for 90 days)"
    echo "2. Artifact upload failed in the binary_builder workflow"
    echo "3. Insufficient permissions to access artifacts"
    echo "4. Incorrect artifact naming or path"
    exit 1
```

Common causes of missing artifacts include:
1. **Artifact Expiration**: GitHub stores artifacts for 90 days by default
2. **Failed Upload**: The Binary Builder workflow may have failed to upload artifacts
3. **Permission Issues**: The workflow may not have permission to access artifacts
4. **Naming Issues**: The artifact names may not match what the workflow expects

### Version Mismatch

If the version in package.json doesn't match the expected format:
1. Ensure the version follows semantic versioning (e.g., 1.2.3)
2. Check that the version can be extracted correctly from package.json
3. Verify that the version is being passed correctly to the release creation step

### Release Already Exists

If a release with the same tag already exists:
1. Delete the existing release
2. Update the version in package.json
3. Re-run the Binary Builder workflow
4. The Release Creator workflow will run automatically after

### Workflow Trigger Issues

If the workflow isn't triggered automatically:
1. Check that the Binary Builder workflow completed successfully
2. Verify that the branch is main
3. Ensure the workflow name in the trigger matches exactly
4. Try manually triggering the workflow