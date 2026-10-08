const fs = require('fs');

const file = 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/routes.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /const defaultThemes = \[\s*['"]\/themes\/theme_phytolore_green\.jpg['"],[\s\S]*?theme_phytolore_green_theme5\.jpg['"]\s*\];/;

const replacement = `const defaultThemes = [
    '/themes/theme_brown.jpg',
    '/themes/theme_blue.jpg',
    '/themes/theme_yellow.jpg',
    '/themes/theme_purple.jpg'
  ];`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('routes.ts updated successfully with 4 themes!');
} else {
  console.log('Regex did not match in routes.ts');
}
