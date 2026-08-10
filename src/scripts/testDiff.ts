import { preprocessDocument, compareDocuments } from '../utils/diffEngine';

function runTests() {
  console.log('=== STARTING DOCUMENT COMPARISON ENGINE TESTS ===\n');

  // Test Case 1: Simple changes, additions, and removals
  const oldText1 = `1. Introduction
This is the original text.
The price of the item is ₹50,000.
We require completion within 30 days.
This section will be deleted.
Thank you for reading.`;

  const newText1 = `1. Introduction
This is the original text.
The price of the item is ₹65,000.
We require completion within 15 days.
This is a newly added line that did not exist.
Thank you for reading.`;

  const pagesOld = [{ pageNum: 1, text: oldText1 }];
  const pagesNew = [{ pageNum: 1, text: newText1 }];

  const oldLines = preprocessDocument(oldText1, pagesOld);
  const newLines = preprocessDocument(newText1, pagesNew);

  console.log('Preprocessed Old Lines count:', oldLines.length);
  console.log('Preprocessed New Lines count:', newLines.length);

  const results = compareDocuments(oldLines, newLines);

  console.log('\n--- Test 1 Comparison Results ---');
  console.log('Total Changes Found:', results.totalChanges);
  console.log('Added Lines count:', results.addedCount);
  console.log('Removed Lines count:', results.removedCount);
  console.log('Changed Lines count:', results.changedCount);

  // Assertions for changes
  const hasAdded = results.changes.some(c => c.type === 'ADDED' && c.newText.includes('newly added line'));
  const hasRemoved = results.changes.some(c => c.type === 'REMOVED' && c.oldText.includes('section will be deleted'));
  const hasChangedPrice = results.changes.some(c => c.type === 'CHANGED' && c.newText.includes('₹65,000'));

  console.log('\nAssertions:');
  console.log('✓ Added line detected:', hasAdded ? 'PASS' : 'FAIL');
  console.log('✓ Removed line detected:', hasRemoved ? 'PASS' : 'FAIL');
  console.log('✓ Modified price line detected:', hasChangedPrice ? 'PASS' : 'FAIL');

  // Assertions for Important Changes
  console.log('\n--- Important Changes (Extracted Values) ---');
  console.log(JSON.stringify(results.importantChanges, null, 2));

  const priceChange = results.importantChanges.find(i => i.label.includes('Price') && i.oldVal === '₹50,000' && i.newVal === '₹65,000');
  const deadlineChange = results.importantChanges.find(i => i.label.includes('Timeline') && i.oldVal === '30' && i.newVal === '15');

  console.log('\nValue Extractions:');
  console.log('✓ Price Change extracted:', priceChange ? 'PASS' : 'FAIL');
  console.log('✓ Deadline Change extracted:', deadlineChange ? 'PASS' : 'FAIL');

  if (hasAdded && hasRemoved && hasChangedPrice && priceChange && deadlineChange) {
    console.log('\nALL ENGINE TESTS PASSED SUCCESSFULLY! 🎉\n');
    process.exit(0);
  } else {
    console.error('\nSOME ENGINE TESTS FAILED! ❌\n');
    process.exit(1);
  }
}

runTests();
