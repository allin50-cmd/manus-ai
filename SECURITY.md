# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (`main`) | Yes |
| Older branches | No |

## Reporting a Vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

Email **[security@fineguardpro.com](mailto:security@fineguardpro.com)** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- Affected components
- Your contact details

We acknowledge reports within **48 hours** and aim to provide an initial assessment within **5 business days**.

## Responsible Disclosure

We follow coordinated disclosure:

1. You report the vulnerability privately
2. We investigate and develop a fix
3. We release the fix and publish a security advisory
4. You may publicly disclose after the fix ships (or 90 days if unresolved)

We will not take legal action against researchers acting in good faith under this policy.

## Scope

In-scope:
- FineGuard Pro API and frontend
- Authentication / session management
- tRPC router access controls
- Data exposure vulnerabilities
- Stripe webhook handling
- Dependency vulnerabilities with exploitable attack vectors

Out-of-scope:
- Denial of service attacks
- Social engineering
- Issues in upstream services (Stripe, ClickSend, Companies House API)

## Security Measures

- AES-256 encryption at rest, TLS 1.3 in transit
- Hosted on Microsoft Azure UK South (ISO 27001)
- Stripe for PCI-DSS compliant payment processing
- UK GDPR compliant data handling
- Automated Dependabot dependency updates
- Rate limiting on all public endpoints
