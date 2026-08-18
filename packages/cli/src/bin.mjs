#!/usr/bin/env node
import {listAllTemplates, listTemplates, templateKinds} from './registry.mjs';
import {scaffold} from './scaffold.mjs';

const usage = `kioku-ui — scaffolds Kioku UI source into a host application

Usage:
  kioku-ui list [kind]          List templates. kind: ${templateKinds.join(', ')}
  kioku-ui add <kind> <id>      Copy one template into the current directory
  kioku-ui doctor               Report templates whose manifest is broken

Options:
  --dest <path>                 Write into <path> instead of the working directory
  --force                       Overwrite files that already exist
`;

function parseOptions(argv) {
  const options = {dest: process.cwd(), force: false, positional: []};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--force') {
      options.force = true;
    } else if (value === '--dest') {
      index += 1;
      options.dest = argv[index] ?? options.dest;
    } else {
      options.positional.push(value);
    }
  }

  return options;
}

async function runList(kind) {
  const result = kind ? await listTemplates(kind) : await listAllTemplates();

  for (const template of result.templates) {
    console.log(`${template.kind}/${template.id} — ${template.description}`);
  }
  if (result.templates.length === 0) {
    console.log('No templates found.');
  }
}

async function runAdd(kind, id, options) {
  const result = await scaffold({
    destination: options.dest,
    force: options.force,
    id,
    kind,
  });

  for (const file of result.written) {
    console.log(`written  ${file}`);
  }
  for (const file of result.skipped) {
    console.log(`skipped  ${file} (already exists; pass --force to overwrite)`);
  }
}

async function runDoctor() {
  const {problems} = await listAllTemplates();

  if (problems.length === 0) {
    console.log('Every template manifest resolves.');
    return;
  }

  for (const problem of problems) {
    console.error(problem);
  }
  process.exitCode = 1;
}

export async function main(argv) {
  const options = parseOptions(argv);
  const [command, ...rest] = options.positional;

  if (command === undefined || command === 'help' || command === '--help') {
    console.log(usage);
    return;
  }

  if (command === 'list') {
    await runList(rest[0]);
    return;
  }

  if (command === 'add') {
    const [kind, id] = rest;
    if (!kind || !id) {
      console.error('Usage: kioku-ui add <kind> <id>');
      process.exitCode = 1;
      return;
    }
    await runAdd(kind, id, options);
    return;
  }

  if (command === 'doctor') {
    await runDoctor();
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error(usage);
  process.exitCode = 1;
}

if (process.argv[1]?.endsWith('bin.mjs')) {
  await main(process.argv.slice(2));
}
