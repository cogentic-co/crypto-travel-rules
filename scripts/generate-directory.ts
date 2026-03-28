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
  const tx = activeRule.threshold.transmission;
  const vx = activeRule.threshold.verification;
  if (tx.amount === vx.amount && tx.isZeroThreshold === vx.isZeroThreshold) {
    // Both tiers are the same — show a single value
    if (tx.isZeroThreshold) {
      threshold = `${tx.currency} 0 (all transfers)`;
    } else {
      threshold = `${tx.currency} ${tx.amount.toLocaleString('en-US')}`;
    }
  } else {
    // Tiers differ — show transmission / verification
    const txAmt = tx.isZeroThreshold ? '0' : tx.amount.toLocaleString('en-US');
    const vxAmt = vx.isZeroThreshold ? '0' : vx.amount.toLocaleString('en-US');
    threshold = `${tx.currency} ${txAmt} / ${vxAmt}`;
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
