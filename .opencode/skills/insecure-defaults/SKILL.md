---
name: insecure-defaults
description: Use when finding insecure default configurations like hardcoded secrets, default credentials, or debug modes in production.
---

# Insecure Defaults

## When to Use This Skill
- Scanning for hardcoded secrets in source code
- Checking for default credentials in configurations
- Identifying weak cryptographic algorithms
- Finding permissive CORS or debug modes in production

## Workflow
1. Search for hardcoded secrets: API keys, passwords, tokens in source files
2. Check configuration files for default credentials
3. Audit cryptographic usage: weak algorithms (MD5, SHA1), insecure modes (ECB)
4. Review CORS headers: check for wildcard origins or overly permissive policies
5. Check for debug modes: verbose errors, stack traces, admin panels in production
6. Scan environment files for committed secrets
7. Report findings with severity and remediation steps

## Rules
- Never commit secrets to source control — use environment variables
- Check all configuration files, not just the main ones
- Look for secrets in comments, TODO files, and test fixtures
- Report weak crypto even if it's not immediately exploitable
- Check CORS in both development and production configurations
- Verify that debug endpoints are not accessible in production
