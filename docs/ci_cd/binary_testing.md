# Binary Testing Workflow

This document provides detailed information about the Binary Testing workflow, which is responsible for testing the binary artifacts produced by the Binary Builder workflow across multiple platforms.

## Table of Contents

- [Overview](#overview)
- [Trigger Conditions](#trigger-conditions)
- [Environment Variables](#environment-variables)
- [Permissions](#permissions)
- [Jobs and Steps](#jobs-and-steps)
- [Test Matrix](#test-matrix)
- [Test Stages](#test-stages)
- [Issue Creation](#issue-creation)
- [Release Notes Update](#release-notes-update)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

## Overview

The Binary Testing workflow (`binary_testing.yaml`) is responsible for testing the binary artifacts produced by the Binary Builder workflow. It runs after the Binary Builder workflow completes successfully, downloading the binary artifacts and running a series of tests to ensure they function correctly on each platform.

### Purpose and Goals

- Verify that built binaries function correctly on their target platforms
- Test multiple aspects of binary functionality
- Report test results and create issues for failures
- Update release notes with test results
- Ensure high-quality releases across all supported platforms

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
      - development
  workflow_dispatch:  # Allow manual triggering
```

- **After Binary Builder**: Automatically triggered when the "Build and Package Agents-Fun" workflow completes on the main or development branches
- **Manual Trigger**: Can be manually triggered through the GitHub Actions interface

## Environment Variables

The workflow defines several global environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `BINARY_NAME` | agent_runner | The name of the binary to test |
| `TEST_TIMEOUT` | 60 | Timeout for individual tests in seconds |

These variables are used throughout the workflow to ensure consistent testing.

## Permissions

The workflow follows the principle of least privilege by explicitly defining permissions:

```yaml
permissions:
  contents: read
  actions: read
  issues: write  # Required to create GitHub issues for failed tests
```

This ensures that the workflow only has the minimum permissions required to perform its tasks.

## Jobs and Steps

The workflow consists of three main jobs:

1. **prepare-testing**: Prepares the test matrix based on available artifacts
2. **test-binaries**: Tests each binary on its respective platform
3. **update-release-notes**: Updates release notes with test results
4. **notify-completion**: Notifies of workflow completion

### Prepare Testing Job

The prepare-testing job:
1. Extracts the version from package.json
2. Gets information about available artifacts
3. Creates a test matrix based on available artifacts

### Test Binaries Job

The test-binaries job:
1. Downloads the binary artifact for the current matrix combination
2. Makes the binary executable (for Linux/macOS)
3. Creates a test directory structure with a minimal character file
4. Runs a series of tests on the binary
5. Generates a test summary
6. Creates a GitHub issue for failed tests

### Update Release Notes Job

The update-release-notes job:
1. Downloads test results
2. Gets the latest release
3. Updates the release notes with test results

### Notify Completion Job

The notify-completion job:
1. Generates a summary of the workflow results
2. Provides a link to the workflow run for more details

## Test Matrix

The workflow uses a dynamic test matrix based on the available binary artifacts:

```yaml
strategy:
  fail-fast: false  # Continue with other tests if one fails
  matrix: ${{ fromJson(needs.prepare-testing.outputs.matrix) }}
```

This ensures that each binary is tested on its appropriate platform:
- Linux binaries (x64, arm64) → Tested on Ubuntu
- macOS binaries (x64, arm64) → Tested on macOS
- Windows binaries (x64) → Tested on Windows

## Test Stages

Each binary goes through the following test stages:

### 1. Binary Execution Test

Verifies that the binary can be executed with the `--version` flag:

```yaml
- name: Test binary execution
  id: test_execution
  shell: bash
  run: |
    echo "🧪 Testing binary execution..."
    
    # Different command based on OS
    if [[ "${{ runner.os }}" == "Windows" ]]; then
      # Windows binary
      ./test-binary/${{ matrix.artifact_name }}.exe --version || exit_code=$?
    else
      # Linux/macOS binary
      ./test-binary/${{ matrix.artifact_name }} --version || exit_code=$?
    fi
    
    if [[ $exit_code -eq 0 ]]; then
      echo "✅ Binary executes successfully"
      echo "test_execution=pass" >> $GITHUB_OUTPUT
    else
      echo "❌ Binary execution failed with exit code: $exit_code"
      echo "test_execution=fail" >> $GITHUB_OUTPUT
      echo "::error::Binary execution test failed for ${{ matrix.artifact_name }}"
    fi
```

### 2. Version Test

Confirms that the reported version matches the expected version from package.json:

```yaml
- name: Test version output
  id: test_version
  if: steps.test_execution.outputs.test_execution == 'pass'
  shell: bash
  run: |
    echo "🧪 Testing version output..."
    
    # Get expected version
    expected_version="${{ needs.prepare-testing.outputs.version }}"
    
    # Run binary with --version flag and capture output
    if [[ "${{ runner.os }}" == "Windows" ]]; then
      # Windows binary
      version_output=$(./test-binary/${{ matrix.artifact_name }}.exe --version)
    else
      # Linux/macOS binary
      version_output=$(./test-binary/${{ matrix.artifact_name }} --version)
    fi
    
    # Check if version output contains expected version
    if [[ "$version_output" == *"$expected_version"* ]]; then
      echo "✅ Version output matches expected version: $expected_version"
      echo "test_version=pass" >> $GITHUB_OUTPUT
    else
      echo "❌ Version output does not match expected version"
      echo "Expected: $expected_version"
      echo "Got: $version_output"
      echo "test_version=fail" >> $GITHUB_OUTPUT
      echo "::error::Version test failed for ${{ matrix.artifact_name }}. Expected $expected_version but got $version_output"
    fi
```

### 3. Command-line Arguments Test

Tests that the `--help` flag works correctly:

```yaml
- name: Test command-line arguments
  id: test_arguments
  if: steps.test_execution.outputs.test_execution == 'pass'
  shell: bash
  run: |
    echo "🧪 Testing command-line arguments..."
    
    # Run binary with --help flag
    if [[ "${{ runner.os }}" == "Windows" ]]; then
      # Windows binary
      ./test-binary/${{ matrix.artifact_name }}.exe --help || exit_code=$?
    else
      # Linux/macOS binary
      ./test-binary/${{ matrix.artifact_name }} --help || exit_code=$?
    fi
    
    if [[ $exit_code -eq 0 ]]; then
      echo "✅ Command-line arguments test passed"
      echo "test_arguments=pass" >> $GITHUB_OUTPUT
    else
      echo "❌ Command-line arguments test failed with exit code: $exit_code"
      echo "test_arguments=fail" >> $GITHUB_OUTPUT
      echo "::error::Command-line arguments test failed for ${{ matrix.artifact_name }}"
    fi
```

### 4. Character Loading Test

Validates that the binary can load a character definition file:

```yaml
- name: Test character loading
  id: test_character
  if: steps.test_execution.outputs.test_execution == 'pass'
  shell: bash
  timeout-minutes: 1
  run: |
    echo "🧪 Testing character loading..."
    
    # Run binary with character file (with timeout to prevent hanging)
    if [[ "${{ runner.os }}" == "Windows" ]]; then
      # Windows binary
      timeout ${{ env.TEST_TIMEOUT }} ./test-binary/${{ matrix.artifact_name }}.exe --character=characters/test.character.json --test-mode || exit_code=$?
    else
      # Linux/macOS binary
      timeout ${{ env.TEST_TIMEOUT }} ./test-binary/${{ matrix.artifact_name }} --character=characters/test.character.json --test-mode || exit_code=$?
    fi
    
    # Exit code 124 means timeout occurred, which is expected for a normal run
    if [[ $exit_code -eq 0 || $exit_code -eq 124 ]]; then
      echo "✅ Character loading test passed"
      echo "test_character=pass" >> $GITHUB_OUTPUT
    else
      echo "❌ Character loading test failed with exit code: $exit_code"
      echo "test_character=fail" >> $GITHUB_OUTPUT
      echo "::error::Character loading test failed for ${{ matrix.artifact_name }}"
    fi
```

## Issue Creation

For failed tests, the workflow automatically creates a GitHub issue:

```yaml
- name: Create issue for failed tests
  if: steps.test_summary.outputs.overall_result == 'fail'
  uses: JasonEtco/create-an-issue@e27dddc79c92bc6e4562f268fffa5ed752639abd # v2.9.1
  env:
    GITHUB_TOKEN: ${{ github.token }}
    ARTIFACT_NAME: ${{ matrix.artifact_name }}
    OS: ${{ matrix.os }}
    TEST_EXECUTION: ${{ steps.test_execution.outputs.test_execution }}
    TEST_VERSION: ${{ steps.test_version.outputs.test_version }}
    TEST_ARGUMENTS: ${{ steps.test_arguments.outputs.test_arguments }}
    TEST_CHARACTER: ${{ steps.test_character.outputs.test_character }}
    WORKFLOW_RUN_ID: ${{ github.event.workflow_run.id }}
  with:
    filename: .github/ISSUE_TEMPLATE/binary_test_failure.md
    update_existing: true
    search_existing: open
```

The issue includes:
- Binary information (name, platform)
- Test results for each test stage
- Links to the workflow run for more details
- Next steps for resolving the issue

## Release Notes Update

The workflow updates release notes with test results:

```yaml
- name: Update release notes
  run: |
    echo "Updating release notes with test results..."
    
    # Get the latest release
    release_id=$(curl -s \
      -H "Authorization: token ${{ github.token }}" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/${{ github.repository }}/releases/latest" | jq -r '.id')
    
    if [[ -z "$release_id" || "$release_id" == "null" ]]; then
      echo "No release found to update"
      exit 0
    fi
    
    # Get current release notes
    current_body=$(curl -s \
      -H "Authorization: token ${{ github.token }}" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/${{ github.repository }}/releases/$release_id" | jq -r '.body')
    
    # Append test results
    updated_body="${current_body}
    
    ## Test Results
    
    | Binary | Status |
    | ------ | ------ |"
    
    # Add results for each binary
    for job in $(curl -s \
      -H "Authorization: token ${{ github.token }}" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/${{ github.repository }}/actions/runs/${{ github.run_id }}/jobs" | \
      jq -r '.jobs[] | select(.name | startswith("Test ")) | .name + ":" + .conclusion'); do
      
      binary_name=$(echo $job | cut -d':' -f1 | sed 's/Test //')
      result=$(echo $job | cut -d':' -f2)
      
      if [[ "$result" == "success" ]]; then
        status="✅ Passed"
      else
        status="❌ Failed"
      fi
      
      updated_body="${updated_body}
    | ${binary_name} | ${status} |"
    done
    
    # Update release notes
    curl -X PATCH \
      -H "Authorization: token ${{ github.token }}" \
      -H "Accept: application/vnd.github.v3+json" \
      -d "{\"body\": $(echo "$updated_body" | jq -R -s .)}" \
      "https://api.github.com/repos/${{ github.repository }}/releases/$release_id"
    
    echo "Release notes updated successfully"
```

This adds a "Test Results" section to the release notes with the status of each binary.

## Common Issues and Troubleshooting

### Binary Not Found

If the workflow cannot find the binary artifact:
1. Check that the Binary Builder workflow completed successfully
2. Verify the artifact naming convention matches between workflows
3. Ensure the artifact retention period hasn't expired (default: 90 days)

### Permission Denied

If you encounter "Permission denied" errors:
1. Ensure the binary has executable permissions (`chmod +x` on Linux/macOS)
2. Check that the workflow has appropriate permissions to access artifacts

### Test Timeouts

If tests are timing out:
1. Adjust the `TEST_TIMEOUT` environment variable in the workflow
2. Check if the binary is hanging during execution
3. Consider adding debug output to identify where the hang occurs

### Platform-Specific Failures

If tests fail only on specific platforms:
1. Check for platform-specific dependencies
2. Verify that the binary was built correctly for that platform
3. Look for platform-specific code paths that might be failing

### Issue Creation Failures

If issues aren't being created for failed tests:
1. Check that the workflow has the `issues: write` permission
2. Verify that the issue template exists at `.github/ISSUE_TEMPLATE/binary_test_failure.md`
3. Check for rate limiting or other GitHub API issues

### Release Notes Update Failures

If release notes aren't being updated:
1. Check that a release exists
2. Verify that the workflow has permission to update releases
3. Check for GitHub API errors in the workflow logs