# Kioku UI

Kioku UI is a public design system for building accessible React interfaces. It is product-neutral: Kioku Console is its first host application, not a source of domain concepts for the system.

## System language

**Foundation**:
The shared visual and accessibility rules that make interfaces coherent, including tokens for color roles, typography, spacing, motion, density, and focus treatment.
_Avoid_: Base CSS, global styles

**Core component**:
An independently documented, accessible React building block with a stable public API. It contains no host application's data, routes, copy, or business rules.
_Avoid_: Widget, screen fragment

**Pattern**:
A reusable composition of core components that solves a common interaction or layout problem while remaining independent of a host application's domain.
_Avoid_: Page, feature

**Template**:
A documented page or block starting point distributed as source through the CLI. A consumer owns the resulting source and connects it to its own routes, data, and content.
_Avoid_: Domain screen, permanent black-box page

**Host application**:
An application that installs Kioku UI and supplies routing, data access, domain language, translations, and product-specific behavior.
_Avoid_: Consumer app, downstream project

## Visual language

**Token contract**:
The stable set of semantic visual roles that components consume and themes fulfill. Components never depend on a named palette or product-specific raw value.
_Avoid_: Palette, skin variables

**Theme**:
A complete implementation of the token contract for one visual identity and color mode.
_Avoid_: Skin, color scheme

**Theme pack**:
A published package that supplies one or more named themes without changing core components.
_Avoid_: Built-in palette, core theme

**Density**:
The spatial scale selected by a host application or reader without changing component semantics.
_Avoid_: Compact theme, layout mode

## Distribution language

**Compiled distribution**:
The prebuilt JavaScript and CSS a host application imports without configuring a source compiler.
_Avoid_: Runtime build, copied source

**Source distribution**:
The authored component source and build integration for hosts that intentionally compile Kioku UI with their own StyleX pipeline.
_Avoid_: Development files, unbundled package

**Integration**:
A package that contributes documented components, templates, themes, or codemods to the Kioku UI CLI discovery surface.
_Avoid_: Plugin, extension
