# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.3.x   | :white_check_mark: |
| 2.2.x   | :white_check_mark: |
| 2.1.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in this project, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email your report to the repository maintainer via GitHub's private vulnerability reporting:
   - Go to the [Security tab](https://github.com/hamahasan441-png/Ai/security) of this repository
   - Click "Report a vulnerability"
   - Provide a detailed description of the vulnerability

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix timeline**: Depends on severity
  - Critical: 24-72 hours
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

### Security Best Practices for Users

1. **API Keys**: Never commit API keys to version control. Use environment variables or `.env` files (which are gitignored).
2. **Database Tool**: The DatabaseTool runs in read-only mode by default. Only enable write mode when necessary and with trusted queries.
3. **Bash Tool**: Be cautious with the BashTool — it can execute arbitrary commands. Review tool permissions carefully.
4. **MCP Servers**: Only connect to trusted MCP servers, as they can expose additional capabilities to the AI.
5. **Dependencies**: Keep dependencies updated. Run `npm audit` regularly to check for known vulnerabilities.

### Scope

The following are in scope for security reports:

- Remote code execution
- SQL injection via DatabaseTool
- Command injection via BashTool
- Authentication/authorization bypass
- Sensitive data exposure
- Cross-site scripting (if web UI is added)
- Denial of service
- Dependency vulnerabilities

### Out of Scope

- Issues in third-party dependencies (report to the relevant project)
- Social engineering attacks
- Physical access attacks
- Issues requiring unlikely user interaction

## Acknowledgments

We appreciate the security research community's efforts in helping keep this project safe. Contributors who responsibly disclose vulnerabilities will be acknowledged (with permission) in our release notes.
