---
name: Workflow Failure
about: Automatically created when workflow monitoring detects failures
title: "🚨 Workflow Failure: {{ env.WORKFLOW_NAME }}"
labels: ci-cd, monitoring, automated
assignees: ''
---

# Workflow Failure Report

## Overview

- **Workflow:** {{ env.WORKFLOW_NAME }}
- **Status:** Failed
- **Run ID:** [{{ env.WORKFLOW_RUN_ID }}]({{ github.server_url }}/{{ github.repository }}/actions/runs/{{ env.WORKFLOW_RUN_ID }})
- **Detected At:** {{ date | date('YYYY-MM-DD HH:mm:ss') }}
- **Critical:** {{ env.IS_CRITICAL }}

## Issues Detected

{% for issue in env.ISSUES %}
- {{ issue }}
{% endfor %}

## Metrics

- **Success Rate:** {{ env.SUCCESS_RATE }}%
- **Average Duration:** {{ env.AVG_DURATION }} minutes
- **Expected Duration:** {{ env.EXPECTED_DURATION }} minutes

## Possible Causes

1. Configuration errors in workflow file
2. Resource constraints or timeouts
3. External dependencies unavailable
4. Code changes that broke the workflow
5. Permissions or secrets issues

## Recommended Actions

1. Review the [workflow run logs]({{ github.server_url }}/{{ github.repository }}/actions/runs/{{ env.WORKFLOW_RUN_ID }})
2. Check recent code changes that might have affected this workflow
3. Verify external dependencies and services are available
4. Test workflow locally if possible
5. Update workflow configuration if needed

## Additional Resources

- [CI/CD Dashboard]({{ github.server_url }}/{{ github.repository }}/blob/main/docs/ci_cd/dashboard.md)
- [Workflow Monitoring Configuration]({{ github.server_url }}/{{ github.repository }}/blob/main/.github/workflow_monitoring_config.json)
- [GitHub Actions Best Practices]({{ github.server_url }}/{{ github.repository }}/blob/main/docs/github_actions_best_practices.md)

---

*This issue was automatically created by the Workflow Monitoring system.*