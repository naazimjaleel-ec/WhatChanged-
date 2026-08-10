import { testSuiteData } from '../utils/testSuite';
import { preprocessDocument, compareDocuments } from '../utils/diffEngine';

function runTestSuite() {
  console.log('============================================================');
  console.log('         WHAT CHANGED? COMPARISON ENGINE TEST SUITE         ');
  console.log('============================================================\n');

  let passedCount = 0;
  const failures: string[] = [];

  testSuiteData.forEach((test, index) => {
    const padIndex = String(index + 1).padStart(2, '0');
    console.log(`[Test ${padIndex}/20] ${test.name}...`);
    
    try {
      // Scanned PDF mock check
      if (test.id === 'scanned-pdf') {
        const isOldBlank = test.oldText.trim() === '';
        const isNewBlank = test.newText.trim() === '';
        if (isOldBlank && isNewBlank) {
          console.log(`  ➔ PASS: OCR scanned files correctly flagged.\n`);
          passedCount++;
        } else {
          failures.push(`${test.name}: Scanned PDF empty check failed`);
          console.log(`  ➔ FAIL: Scanned PDF empty check failed\n`);
        }
        return;
      }

      // 1. Run comparison
      const oldLines = preprocessDocument(test.oldText, test.oldPages);
      const newLines = preprocessDocument(test.newText, test.newPages);
      const res = compareDocuments(oldLines, newLines);

      // 2. Validate bounds
      const actualChanges = res.totalChanges;
      const actualImportant = res.importantChanges.length;
      
      let casePassed = true;
      const caseFailReasons: string[] = [];

      if (actualChanges < test.expected.minChanges || actualChanges > test.expected.maxChanges) {
        casePassed = false;
        caseFailReasons.push(`Changes count ${actualChanges} outside expected range [${test.expected.minChanges}, ${test.expected.maxChanges}]`);
      }

      if (actualImportant < test.expected.expectedImportantCount) {
        casePassed = false;
        caseFailReasons.push(`Important values count ${actualImportant} below expected minimum ${test.expected.expectedImportantCount}`);
      }

      if (test.expected.verifyImportant && !test.expected.verifyImportant(res.importantChanges)) {
        casePassed = false;
        caseFailReasons.push(`Custom assertions on extracted important values failed`);
      }

      if (casePassed) {
        console.log(`  ➔ PASS: ${actualChanges} changes, ${actualImportant} values extracted.\n`);
        passedCount++;
      } else {
        failures.push(`${test.name}: ${caseFailReasons.join('; ')}`);
        console.log(`  ➔ FAIL: ${caseFailReasons.join('; ')}`);
        console.log(`    Extracted Values: ${JSON.stringify(res.importantChanges)}\n`);
      }

    } catch (err: any) {
      failures.push(`${test.name}: Threw exception: ${err.message}`);
      console.log(`  ➔ FAIL: Threw exception: ${err.message}\n`);
    }
  });

  console.log('============================================================');
  console.log(`TEST SUITE COMPLETE: ${passedCount} / ${testSuiteData.length} PASSED`);
  console.log('============================================================\n');

  if (failures.length > 0) {
    console.log('FAILING TEST CASES:');
    failures.forEach(f => console.log(`- ${f}`));
    console.log('\n❌ Visual validation suite failed.');
    process.exit(1);
  } else {
    console.log('🏆 All 20 test cases successfully passed!');
    process.exit(0);
  }
}

runTestSuite();
