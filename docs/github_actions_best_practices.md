# GitHub Actions Best Practices

This document outlines the best practices implemented in our GitHub Actions workflows to ensure security, efficiency, and maintainability.

## Table of Contents

- [Security Measures](#security-measures)
- [Efficiency Optimizations](#efficiency-optimizations)
- [Maintainability Improvements](#maintainability-improvements)
- [Guidelines for Future Workflow Development](#guidelines-for-future-workflow-development)

## Security Measures

### Principle of Least Privilege

We've implemented the principle of least privilege by explicitly defining permissions for each workflow:

```yaml
permissions:
  contents: read  # Only read access to repository contents
  packages: read  # Only read access to packages
  actions: read   # Only read access to actions
```

This ensures that workflows only have the minimum permissions required to perform their tasks, reducing the potential impact of a compromised workflow.

### Pinned Action Versions with SHA Hashes

All external actions are pinned to specific SHA hashes instead of using tags:

```yaml
# Instead of this (insecure):
uses: actions/checkout@v4

# We use this (secure):
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
```

This prevents supply chain attacks where a malicious actor could replace a tagged version with malicious code.

### Timeout Limits for Jobs

All jobs have timeout limits to prevent runaway workflows that could consume excessive resources:

```yaml
jobs:
  build:
    timeout-minutes: 60  # Prevent runaway workflows
```

### GITHUB_TOKEN Permissions Restrictions

We use the built-in `github.token` with minimal permissions instead of using `secrets.GITHUB_TOKEN`:

```yaml
with:
  github-token: ${{ github.token }}
```

This ensures that the token only has the permissions explicitly granted to the workflow.

### Workflow Validation

We've implemented a workflow validation job that runs on pull requests to ensure that all workflows follow our security best practices:

- Checks for pinned action versions
- Validates explicit permissions
- Ensures timeout limits are set for all jobs

## Efficiency Optimizations

### Concurrency Controls

We've implemented concurrency controls to cancel redundant workflow runs:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

This prevents multiple workflow runs from executing simultaneously on the same branch, saving CI/CD resources.

### Job Dependencies

Jobs are structured with clear dependencies to ensure efficient execution:

- The release creation job only runs after the binary build job completes successfully
- Validation checks run in parallel to speed up feedback

### Optimized GitHub-hosted Runners

We've optimized the use of GitHub-hosted runners:

- Using shallow clones (`fetch-depth: 1`) to speed up checkout
- Implementing effective caching strategies for dependencies
- Using the appropriate runner for each job (e.g., ubuntu-latest for most jobs)

### Path Filtering

We've implemented path filtering to avoid unnecessary workflow runs:

```yaml
on:
  push:
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

This prevents workflows from running when only documentation files are changed.

## Maintainability Improvements

### Comprehensive Comments

We've added comprehensive comments to explain complex steps:

```yaml
# Extract version from package.json early to use throughout the workflow
- name: Extract version
  id: extract_version
  shell: bash
  run: |
    VERSION=$(jq -r '.version' agents-fun/package.json)
    echo "VERSION=${VERSION}" >> $GITHUB_ENV
```

### Consistent Naming Conventions

We've implemented consistent naming conventions:

- Job names use kebab-case: `create-release`
- Step names use sentence case with clear descriptions: `Extract version`
- Environment variables use UPPER_SNAKE_CASE: `BINARY_NAME`

### Workflow Status Badges

We've added workflow status badges to the README.md:

```markdown
[![Build and Package](https://github.com/username/agents-fun-eliza/actions/workflows/binary_builder.yaml/badge.svg)](https://github.com/username/agents-fun-eliza/actions/workflows/binary_builder.yaml)
[![Create Release](https://github.com/username/agents-fun-eliza/actions/workflows/release_creator.yaml/badge.svg)](https://github.com/username/agents-fun-eliza/actions/workflows/release_creator.yaml)
```

### Reusable Workflow Components

We've structured our workflows to promote reusability:

- Environment variables are defined at the top level
- Matrix builds are used to handle multiple platforms and architectures
- Common steps are structured consistently across workflows

## Guidelines for Future Workflow Development

When developing new GitHub Actions workflows, follow these guidelines:

### Security

1. **Always define explicit permissions** using the principle of least privilege
2. **Pin all external actions** to specific SHA hashes
3. **Set timeout limits** for all jobs
4. **Use `github.token`** instead of `secrets.GITHUB_TOKEN` when possible
5. **Validate workflow files** using the workflow-validation workflow

### Efficiency

1. **Implement concurrency controls** to prevent redundant workflow runs
2. **Use path filtering** to avoid unnecessary workflow runs
3. **Optimize checkout operations** with shallow clones
4. **Implement effective caching strategies** for dependencies
5. **Structure jobs with clear dependencies** to ensure efficient execution

### Maintainability

1. **Add comprehensive comments** to explain complex steps
2. **Use consistent naming conventions** across all workflows
3. **Add workflow status badges** to the README.md
4. **Structure workflows to promote reusability**
5. **Keep workflows focused on a single responsibility**

By following these guidelines, we can ensure that our GitHub Actions workflows remain secure, efficient, and maintainable as our project evolves.