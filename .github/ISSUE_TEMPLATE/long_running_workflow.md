---
name: Long Running Workflow
about: Automatically created when workflow monitoring detects workflows exceeding expected duration
title: "⏱️ Long Running Workflow: {{ env.WORKFLOW_NAME }}"
labels: ci-cd, monitoring, performance, automated
assignees: ''
---

# Long Running Workflow Report

## Overview

- **Workflow:** {{ env.WORKFLOW_NAME }}
- **Status:** Running Longer Than Expected
- **Run ID:** [{{ env.WORKFLOW_RUN_ID }}]({{ github.server_url }}/{{ github.repository }}/actions/runs/{{ env.WORKFLOW_RUN_ID }})
- **Detected At:** {{ date | date('YYYY-MM-DD HH:mm:ss') }}
- **Critical:** {{ env.IS_CRITICAL }}

## Performance Metrics

- **Current Duration:** {{ env.CURRENT_DURATION }} minutes
- **Expected Duration:** {{ env.EXPECTED_DURATION }} minutes
- **Exceeds Expected By:** {{ env.DURATION_DIFFERENCE }} minutes ({{ env.DURATION_PERCENT }}%)
- **Average Duration (Last 30 Days):** {{ env.AVG_DURATION }} minutes

## Job Details

{% for job in env.LONG_RUNNING_JOBS %}
### {{ job.name }}
- **Status:** {{ job.status }}
- **Duration:** {{ job.duration }} minutes
- **Expected Duration:** {{ job.expected_duration }} minutes
{% endfor %}

## Possible Causes

1. Increased repository size or complexity
2. Resource constraints on GitHub runners
3. Inefficient workflow steps or scripts
4. External dependencies or services running slowly
5. Network latency or download/upload issues
6. Caching issues or missing cache hits

## Recommended Actions

1. Review the [workflow run logs]({{ github.server_url }}/{{ github.repository }}/actions/runs/{{ env.WORKFLOW_RUN_ID }})
2. Identify the slowest steps in the workflow
3. Optimize resource-intensive operations
4. Improve caching strategies
5. Consider splitting the workflow into smaller, parallel jobs
6. Update expected duration in the monitoring configuration if the workflow has legitimately grown in complexity

## Additional Resources

- [CI/CD Dashboard]({{ github.server_url }}/{{ github.repository }}/blob/main/docs/ci_cd/dashboard.md)
- [Workflow Monitoring Configuration]({{ github.server_url }}/{{ github.repository }}/blob/main/.github/workflow_monitoring_config.json)
- [GitHub Actions Best Practices]({{ github.server_url }}/{{ github.repository }}/blob/main/docs/github_actions_best_practices.md)

---

*This issue was automatically created by the Workflow Monitoring system.*