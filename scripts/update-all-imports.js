const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all .ts and .tsx files
const files = glob.sync('src/**/*.{ts,tsx}', { cwd: path.join(__dirname, '..') });

let updatedCount = 0;
let errorCount = 0;

files.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Check if file uses old context imports
    if (content.includes("from '@/contexts/ThemeContext'") ||
        content.includes("from '@/contexts/NavigationContext'")) {

      // Replace ThemeContext imports
      content = content.replace(/from '@\/contexts\/ThemeContext'/g, "from '@/lib/stores/appStore'");

      // Replace NavigationContext imports
      content = content.replace(/from '@\/contexts\/NavigationContext'/g, "from '@/lib/stores/appStore'");

      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Updated: ${file}`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`✗ Error updating ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✅ Updated ${updatedCount} files`);
if (errorCount > 0) {
  console.log(`❌ ${errorCount} errors`);
}
