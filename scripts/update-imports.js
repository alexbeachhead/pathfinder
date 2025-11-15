const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/flow-builder/page.tsx',
  'src/app/features/flow-builder/components/FlowBuilder.tsx',
  'src/app/features/flow-builder/components/StepEditor.tsx',
  'src/app/features/flow-builder/components/FlowCanvas.tsx',
  'src/app/features/flow-builder/components/StepPalette.tsx',
  'src/app/features/reports/components/TestResultsTable.tsx',
  'src/app/features/reports/components/RootCauseAnalysisModal.tsx',
  'src/app/features/nl-test/components/AdaptivePromptSelector.tsx',
  'src/app/features/reports/Reports.tsx',
  'src/app/features/reports/components/CreateTicketModal.tsx',
  'src/app/features/nl-test/components/PerformanceStats.tsx',
  'src/app/features/reports/components/TourModal.tsx',
  'src/app/features/reports/components/ViewportGrid.tsx',
  'src/app/features/reports/components/ScreenshotComparison.tsx',
  'src/app/features/designer/components/StepAnalysis.tsx',
];

filesToUpdate.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} - file not found`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Replace ThemeContext imports
    if (content.includes("from '@/contexts/ThemeContext'")) {
      content = content.replace(/from '@\/contexts\/ThemeContext'/g, "from '@/lib/stores/appStore'");
      updated = true;
    }

    // Replace NavigationContext imports
    if (content.includes("from '@/contexts/NavigationContext'")) {
      content = content.replace(/from '@\/contexts\/NavigationContext'/g, "from '@/lib/stores/appStore'");
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Updated: ${file}`);
    } else {
      console.log(`- No changes needed: ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error updating ${file}:`, error.message);
  }
});

console.log('\nImport update complete!');
