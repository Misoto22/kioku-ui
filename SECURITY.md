# Security policy

## Supported versions

Kioku UI has not published a release yet. Until the first version ships, only
the `main` branch receives fixes.

## Reporting a vulnerability

Report suspected vulnerabilities through GitHub's private advisory form:

<https://github.com/Misoto22/kioku-ui/security/advisories/new>

Please do not open a public issue for a vulnerability, and do not include a
working exploit against a third party's deployment.

A report is most useful when it says which package and version you looked at,
what an attacker gains, and the smallest reproduction you have. A component
that renders untrusted text — `Markdown`, `CodeBlock`, `Citation` — is the
most likely place for a real finding, so say what input you fed it.

You should get an acknowledgement within five working days. If a report is
accepted, the fix and the advisory are published together.

## What is in scope

This repository ships components, tokens, themes, and build integrations. It
ships no server, no routing, and no data access. In practice that leaves three
kinds of finding worth reporting:

- **Injection through rendered content.** `Markdown` deliberately parses a
  restricted subset and never interprets raw HTML; only `http(s):` and
  root-relative links survive. A way past either rule is in scope.
- **Escaping a boundary the library claims to hold.** For example, a focus
  trap that can be escaped while a modal surface is open, or a portalled
  surface that leaks interaction to the page behind it.
- **Supply chain.** A dependency or build step that ships something other
  than what this repository contains.

Out of scope: findings that require a host application to pass attacker-
controlled values into props documented as trusted, and findings in the
example applications under `apps/example-*`, which exist to prove the packages
build rather than to be deployed.
