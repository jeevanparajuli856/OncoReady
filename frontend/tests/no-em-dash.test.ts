import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');
// Captured Epic Sandbox records are checksum-locked source data and are never rendered as text.
const LOCKED = ['src/data/epic-capture/', 'src/data/epic-roster/'];
const TEXT_FILE = /\.(tsx?|css|html|svg|json)$/;

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });

describe('STYLE-001 web copy', () => {
  it('uses no em dashes anywhere in the web app', () => {
    const offenders = [...files(join(root, 'src')), ...files(join(root, 'public')), join(root, 'index.html')]
      .map((path) => relative(root, path))
      .filter((path) => TEXT_FILE.test(path) && !LOCKED.some((locked) => path.startsWith(locked)))
      .filter((path) => readFileSync(join(root, path), 'utf8').includes('—'));
    expect(offenders).toEqual([]);
  });
});
