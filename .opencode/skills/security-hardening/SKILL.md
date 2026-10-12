---
name: security-hardening
description: Use when hardening systems against common attack vectors — server configuration, headers, permissions, and network policies.
---

# Security Hardening

## When to Use This Skill
- Configuring security headers (CSP, HSTS, X-Frame-Options)
- Hardening server configurations (nginx, Apache, cloud services)
- Restricting permissions and access controls
- Implementing network security policies

## Workflow
1. Add security headers: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options
2. Disable unnecessary features: directory listing, server version disclosure
3. Configure TLS: use TLS 1.3, disable weak ciphers, enable HSTS
4. Set restrictive CORS: specific origins, not wildcards
5. Implement rate limiting on authentication and sensitive endpoints
6. Restrict file permissions: principle of least privilege
7. Enable logging for security events: failed logins, unauthorized access attempts
8. Test with security scanners: Mozilla Observatory, Security Headers

## Rules
- Apply security headers to every response, not just the main site
- Use Content-Security-Policy to restrict script and style sources
- Enable HSTS with a long max-age and includeSubDomains
- Disable server version disclosure in HTTP headers
- Test configurations with SSL Labs and Mozilla Observatory
- Review and update security configurations quarterly
