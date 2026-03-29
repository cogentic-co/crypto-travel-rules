import * as fs from 'fs';
import * as path from 'path';
import type { JurisdictionData } from '../src/types';

const DATA_DIR = path.join(__dirname, '..', 'data', 'jurisdictions');
const OUTPUT = path.join(__dirname, '..', 'data', 'DIRECTORY.md');

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort();

const lines: string[] = [
  '# Full Jurisdiction Directory',
  '',
  `${files.length} jurisdictions. Each row links to the jurisdiction's JSON file.`,
  '',
  '| Code | Jurisdiction | Authority | Threshold | Status |',
  '|------|-------------|-----------|-----------|--------|',
];

for (const file of files) {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
  const data: JurisdictionData = JSON.parse(raw);

  // Find the active rule, or the most recent rule
  const activeRule = data.rules.find(r => r.status === 'active')
    ?? data.rules[data.rules.length - 1];

  const hasPending = data.rules.some(r => r.status === 'pending');

  // Format threshold
  let threshold: string;
  if (activeRule.threshold.isZeroThreshold) {
    threshold = `${activeRule.threshold.currency} 0 (all transfers)`;
  } else {
    threshold = `${activeRule.threshold.currency} ${activeRule.threshold.amount.toLocaleString('en-US')}`;
  }

  // Format status
  let status = activeRule.status.charAt(0).toUpperCase() + activeRule.status.slice(1);
  if (hasPending && activeRule.status === 'active') {
    status = 'Active (update pending)';
  }

  // Shorten authority for table readability
  const authority = data.authority.length > 40
    ? data.authority.substring(0, 37) + '...'
    : data.authority;

  lines.push(
    `| [${data.countryCode}](jurisdictions/${file}) | ${data.name} | ${authority} | ${threshold} | ${status} |`
  );
}

lines.push('');
fs.writeFileSync(OUTPUT, lines.join('\n'));
console.log(`Generated DIRECTORY.md with ${files.length} jurisdictions`);
