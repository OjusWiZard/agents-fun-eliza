# Workflow Validation

This document provides detailed information about the Workflow Validation workflow, which is responsible for ensuring that all GitHub Actions workflows follow our security and best practices guidelines.

## Table of Contents

- [Overview](#overview)
- [Trigger Conditions](#trigger-conditions)
- [Permissions](#permissions)
- [Jobs and Steps](#jobs-and-steps)
- [Validation Checks](#validation-checks)
- [PR Comments](#pr-comments)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

## Overview

The Workflow Validation workflow (`workflow-validation.yaml`) is responsible for validating that all GitHub Actions workflows follow our security and best practices guidelines. It runs on pull requests that modify workflow files, performing a series of checks to ensure that workflows are secure, efficient, and maintainable.

### Purpose and Goals

- Ensure all workflows follow security best practices
- Validate that workflows have appropriate permissions
- Check for pinned action versions to prevent supply chain attacks
- Verify that all jobs have timeout limits to prevent runaway workflows
- Provide feedback on pull requests to help developers fix issues

## Trigger Conditions

The workflow is triggered under the following conditions:

```yaml
on:
  pull_request:
    paths:
      - '.github/workflows/**'
  workflow_dispatch:  # Allow manual triggering
```

- **Pull Requests**: Automatically triggered when a pull request modifies files in the `.github/workflows/` directory
- **Manual Trigger**: Can be manually triggered through the GitHub Actions interface

## Permissions

The workflow requires specific permissions to comment on pull requests:

```yaml
permissions:
  contents: read
  pull-requests: write  # Required to comment on PRs
```

These permissions follow the principle of least privilege while still allowing the workflow to provide feedback on pull requests.

## Jobs and Steps

The workflow consists of three main jobs:

1. **actionlint**: Validates GitHub Actions workflows using the actionlint tool
2. **check-pinned-actions**: Checks that all actions are pinned to specific SHA hashes
3. **check-permissions**: Ensures that all workflows have explicit permissions defined
4. **check-timeouts**: Verifies that all jobs have timeout limits

### Actionlint Job

The actionlint job uses the reviewdog/action-actionlint action to validate workflows:

```yaml
- name: Run actionlint
  uses: reviewdog/action-actionlint@c6ee1eb0a5d47b2af53a203652b5dac0b6c4016e # v1.43.0
  with:
    github_token: ${{ github.token }}
    reporter: github-pr-review
    fail_on_error: true
    filter_mode: nofilter
    level: error
```

This checks for syntax errors, deprecated features, and other issues in workflow files.

### Check Pinned Actions Job

The check-pinned-actions job scans workflow files for unpinned actions:

```yaml
- name: Check for unpinned actions
  id: check-pins
  run: |
    echo "Checking for unpinned actions in workflow files..."
    
    # Find all workflow files
    WORKFLOW_FILES=$(find .github/workflows -name "*.yml" -o -name "*.yaml")
    
    # Initialize counters
    UNPINNED_COUNT=0
    TOTAL_ACTIONS=0
    
    # Create a report file
    REPORT_FILE="unpinned_actions_report.md"
    echo "# Unpinned Actions Report" > $REPORT_FILE
    echo "" >> $REPORT_FILE
    
    for file in $WORKFLOW_FILES; do
      echo "Checking $file" >> $REPORT_FILE
      echo "```" >> $REPORT_FILE
      
      # Find lines with 'uses:' but without a SHA pin
      UNPINNED=$(grep -n "uses:" "$file" | grep -v "#" | grep -v "@[a-f0-9]\{40\}")
      
      if [ -n "$UNPINNED" ]; then
        echo "$UNPINNED" >> $REPORT_FILE
        UNPINNED_COUNT=$((UNPINNED_COUNT + $(echo "$UNPINNED" | wc -l)))
      else
        echo "No unpinned actions found." >> $REPORT_FILE
      fi
      
      # Count total actions
      TOTAL_IN_FILE=$(grep -c "uses:" "$file" || echo 0)
      TOTAL_ACTIONS=$((TOTAL_ACTIONS + TOTAL_IN_FILE))
      
      echo "```" >> $REPORT_FILE
      echo "" >> $REPORT_FILE
    done
    
    # Summary
    echo "## Summary" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "- Total actions: $TOTAL_ACTIONS" >> $REPORT_FILE
    echo "- Unpinned actions: $UNPINNED_COUNT" >> $REPORT_FILE
    
    if [ $UNPINNED_COUNT -gt 0 ]; then
      echo "::warning::Found $UNPINNED_COUNT unpinned actions out of $TOTAL_ACTIONS total actions"
      echo "unpinned_found=true" >> $GITHUB_OUTPUT
    else
      echo "::notice::All actions are properly pinned with SHA hashes! 🎉"
      echo "unpinned_found=false" >> $GITHUB_OUTPUT
    fi
    
    cat $REPORT_FILE
```

This ensures that all actions are pinned to specific SHA hashes to prevent supply chain attacks.

### Check Permissions Job

The check-permissions job verifies that all workflows have explicit permissions defined:

```yaml
- name: Check for missing permissions
  id: check-permissions
  run: |
    echo "Checking for missing permissions in workflow files..."
    
    # Find all workflow files
    WORKFLOW_FILES=$(find .github/workflows -name "*.yml" -o -name "*.yaml")
    
    # Initialize counters
    MISSING_PERMS_COUNT=0
    
    # Create a report file
    REPORT_FILE="permissions_report.md"
    echo "# Workflow Permissions Report" > $REPORT_FILE
    echo "" >> $REPORT_FILE
    
    for file in $WORKFLOW_FILES; do
      echo "Checking $file" >> $REPORT_FILE
      
      # Check if the file has permissions defined
      if ! grep -q "permissions:" "$file"; then
        echo "❌ No permissions defined" >> $REPORT_FILE
        MISSING_PERMS_COUNT=$((MISSING_PERMS_COUNT + 1))
      else
        echo "✅ Permissions defined" >> $REPORT_FILE
      fi
      
      echo "" >> $REPORT_FILE
    done
    
    # Summary
    echo "## Summary" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "- Total workflow files: $(echo "$WORKFLOW_FILES" | wc -l)" >> $REPORT_FILE
    echo "- Files missing permissions: $MISSING_PERMS_COUNT" >> $REPORT_FILE
    
    if [ $MISSING_PERMS_COUNT -gt 0 ]; then
      echo "::warning::Found $MISSING_PERMS_COUNT workflow files without explicit permissions"
      echo "missing_perms=true" >> $GITHUB_OUTPUT
    else
      echo "::notice::All workflow files have explicit permissions defined! 🎉"
      echo "missing_perms=false" >> $GITHUB_OUTPUT
    fi
    
    cat $REPORT_FILE
```

This ensures that all workflows follow the principle of least privilege by explicitly defining permissions.

### Check Timeouts Job

The check-timeouts job verifies that all jobs have timeout limits:

```yaml
- name: Check for missing timeout limits
  id: check-timeouts
  run: |
    echo "Checking for missing timeout limits in workflow files..."
    
    # Find all workflow files
    WORKFLOW_FILES=$(find .github/workflows -name "*.yml" -o -name "*.yaml")
    
    # Initialize counters
    MISSING_TIMEOUTS_COUNT=0
    TOTAL_JOBS=0
    
    # Create a report file
    REPORT_FILE="timeouts_report.md"
    echo "# Workflow Timeout Limits Report" > $REPORT_FILE
    echo "" >> $REPORT_FILE
    
    for file in $WORKFLOW_FILES; do
      echo "Checking $file" >> $REPORT_FILE
      echo "```" >> $REPORT_FILE
      
      # Count jobs in the file
      JOBS_IN_FILE=$(grep -c "^  [a-zA-Z0-9_-]\+:" "$file" || echo 0)
      TOTAL_JOBS=$((TOTAL_JOBS + JOBS_IN_FILE))
      
      # Check for timeout-minutes in each job
      JOBS_WITH_TIMEOUTS=$(grep -c "timeout-minutes:" "$file" || echo 0)
      MISSING_IN_FILE=$((JOBS_IN_FILE - JOBS_WITH_TIMEOUTS))
      MISSING_TIMEOUTS_COUNT=$((MISSING_TIMEOUTS_COUNT + MISSING_IN_FILE))
      
      echo "Jobs: $JOBS_IN_FILE" >> $REPORT_FILE
      echo "Jobs with timeouts: $JOBS_WITH_TIMEOUTS" >> $REPORT_FILE
      echo "Jobs missing timeouts: $MISSING_IN_FILE" >> $REPORT_FILE
      
      echo "```" >> $REPORT_FILE
      echo "" >> $REPORT_FILE
    done
    
    # Summary
    echo "## Summary" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "- Total jobs: $TOTAL_JOBS" >> $REPORT_FILE
    echo "- Jobs missing timeout limits: $MISSING_TIMEOUTS_COUNT" >> $REPORT_FILE
    
    if [ $MISSING_TIMEOUTS_COUNT -gt 0 ]; then
      echo "::warning::Found $MISSING_TIMEOUTS_COUNT jobs without timeout limits out of $TOTAL_JOBS total jobs"
      echo "missing_timeouts=true" >> $GITHUB_OUTPUT
    else
      echo "::notice::All jobs have timeout limits defined! 🎉"
      echo "missing_timeouts=false" >> $GITHUB_OUTPUT
    fi
    
    cat $REPORT_FILE
```

This ensures that all jobs have timeout limits to prevent runaway workflows.

## Validation Checks

The workflow performs the following validation checks:

### 1. Actionlint

Uses the actionlint tool to check for:
- Syntax errors in workflow files
- Deprecated features
- Invalid action inputs
- Other issues with workflow files

### 2. Pinned Actions

Checks that all actions are pinned to specific SHA hashes:

```yaml
# Instead of this (insecure):
uses: actions/checkout@v4

# We use this (secure):
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
```

This prevents supply chain attacks where a malicious actor could replace a tagged version with malicious code.

### 3. Explicit Permissions

Ensures that all workflows have explicit permissions defined:

```yaml
permissions:
  contents: read
  packages: read
  actions: read
```

This follows the principle of least privilege by explicitly defining the permissions required by the workflow.

### 4. Timeout Limits

Verifies that all jobs have timeout limits:

```yaml
jobs:
  build:
    timeout-minutes: 60  # Prevent runaway workflows
```

This prevents runaway workflows that could consume excessive resources.

## PR Comments

For each validation check that fails, the workflow comments on the pull request with details about the issues:

```yaml
- name: Comment on PR
  if: github.event_name == 'pull_request' && steps.check-pins.outputs.unpinned_found == 'true'
  uses: actions/github-script@60a0d83039c74a4aee543508d2ffcb1c3799cdea # v7.0.1
  with:
    github-token: ${{ github.token }}
    script: |
      const fs = require('fs');
      const reportContent = fs.readFileSync('unpinned_actions_report.md', 'utf8');
      
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `## GitHub Actions Security Check\n\nFound unpinned actions in your workflow files. Please pin all actions with SHA hashes for security.\n\n${reportContent}`
      });
```

This provides feedback to developers about issues that need to be fixed.

## Common Issues and Troubleshooting

### Unpinned Actions

If the workflow finds unpinned actions:
1. Replace action references with pinned versions using SHA hashes
2. You can find the SHA hash for an action by looking at its GitHub repository
3. Format: `uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1`

### Missing Permissions

If the workflow finds missing permissions:
1. Add a `permissions` section to the workflow
2. Define the minimum permissions required by the workflow
3. Follow the principle of least privilege

### Missing Timeout Limits

If the workflow finds missing timeout limits:
1. Add a `timeout-minutes` property to each job
2. Set an appropriate timeout based on the expected duration of the job
3. Consider the consequences of a job running indefinitely

### Actionlint Errors

If actionlint finds errors:
1. Check the specific error message in the PR comment
2. Fix the issue in the workflow file
3. Refer to the [actionlint documentation](https://github.com/rhysd/actionlint) for more information

### PR Comments Not Appearing

If PR comments are not appearing:
1. Check that the workflow has the `pull-requests: write` permission
2. Verify that the workflow is running on pull requests
3. Check for GitHub API errors in the workflow logs