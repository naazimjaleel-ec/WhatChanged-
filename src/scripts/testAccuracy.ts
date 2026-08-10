import { preprocessDocument, compareDocuments } from '../utils/diffEngine';

function runAccuracyTests() {
  console.log('=== STARTING ACCURACY & ROBUSTNESS TESTS ===\n');

  // Test Case 1: Paragraph Wrapping Shift (A classic bug in typical line diffs)
  const oldWrapText = `This is a long paragraph that is wrapped
with single newlines inside the document
because of column width constraints.`;

  const newWrapText = `This is a long paragraph that is wrapped with
single newlines inside the document because
of column width constraints.`;

  const oldWrapLines = preprocessDocument(oldWrapText, [{ pageNum: 1, text: oldWrapText }]);
  const newWrapLines = preprocessDocument(newWrapText, [{ pageNum: 1, text: newWrapText }]);

  const wrapResult = compareDocuments(oldWrapLines, newWrapLines);

  console.log('Wrap Shift Test:');
  console.log('Old sentences extracted:', oldWrapLines.map(s => s.text));
  console.log('New sentences extracted:', newWrapLines.map(s => s.text));
  console.log('Changes detected on layout shift:', wrapResult.totalChanges);
  const wrapPass = wrapResult.totalChanges === 0;
  console.log('✓ Layout spacing shift normalizes to 0 changes:', wrapPass ? 'PASS' : 'FAIL');

  console.log('\n----------------------------------------\n');

  // Test Case 2: Multi-value and formatted currencies adjustments
  const oldContract = `SECTION 2. INTEREST RATE
The interest rate shall be 5.5% per annum, effective starting January 12, 2024. The total payout is ₹1,25,000.`;

  const newContract = `SECTION 2. INTEREST RATE
The interest rate shall be 6.2% per annum, effective starting January 15, 2024. The total payout is ₹1,45,000.`;

  const oldContractLines = preprocessDocument(oldContract, [{ pageNum: 1, text: oldContract }]);
  const newContractLines = preprocessDocument(newContract, [{ pageNum: 1, text: newContract }]);

  const contractResult = compareDocuments(oldContractLines, newContractLines);

  console.log('Contract Diff Test:');
  console.log('Total Changes Found:', contractResult.totalChanges);
  console.log('Extracted Values:');
  console.log(JSON.stringify(contractResult.importantChanges, null, 2));

  // Assertions for value extractions
  const hasRate = contractResult.importantChanges.some(i => i.label.includes('Interest') && i.oldVal === '5.5%' && i.newVal === '6.2%');
  const hasDate = contractResult.importantChanges.some(i => i.label.includes('Date') && i.oldVal === 'January 12, 2024' && i.newVal === 'January 15, 2024');
  const hasPrice = contractResult.importantChanges.some(i => i.label.includes('Price') && i.oldVal === '₹1,25,000' && i.newVal === '₹1,45,000');

  console.log('\nValue Extractions Assertions:');
  console.log('✓ Interest Rate (5.5% -> 6.2%) extracted:', hasRate ? 'PASS' : 'FAIL');
  console.log('✓ Effective Date (Jan 12 -> Jan 15) extracted:', hasDate ? 'PASS' : 'FAIL');
  console.log('✓ Price Change (₹1,25,000 -> ₹1,45,000) extracted:', hasPrice ? 'PASS' : 'FAIL');

  console.log('\n----------------------------------------\n');

  // Test Case 3: Sentence pairing for multiple edits inside a single sentence
  const oldSentence = `We will deliver the products within 30 days of the agreement signing.`;
  const newSentence = `We will deliver the products within 15 days of the agreement execution.`;

  const oldSentLines = preprocessDocument(oldSentence, [{ pageNum: 1, text: oldSentence }]);
  const newSentLines = preprocessDocument(newSentence, [{ pageNum: 1, text: newSentence }]);

  const sentResult = compareDocuments(oldSentLines, newSentLines);
  const isPaired = sentResult.changedCount === 1 && sentResult.changes[0].type === 'CHANGED';

  console.log('Sentence Pairing Test:');
  console.log('Changed Count (should be 1 modified sentence):', sentResult.changedCount);
  console.log('Diff HTML generated:', sentResult.changes[0]?.diffHtml);
  console.log('✓ Single sentence with double edits pairs as CHANGED:', isPaired ? 'PASS' : 'FAIL');

  console.log('\n----------------------------------------\n');

  const allPass = wrapPass && hasRate && hasDate && hasPrice && isPaired;
  if (allPass) {
    console.log('ALL ACCURACY AND ROBUSTNESS TESTS PASSED SUCCESSFULLY! 🎯🏆\n');
    process.exit(0);
  } else {
    console.error('SOME ACCURACY TESTS FAILED! ❌\n');
    process.exit(1);
  }
}

runAccuracyTests();
