#!/usr/bin/env python3

import re

# Read the script file
with open('/Users/olu/code/litebible/src/script.js', 'r') as f:
    content = f.read()

# Remove all console.log statements
# This pattern handles:
# - console.log('simple string');
# - console.log('string with ' + variables + ' concatenation');
# - console.log("double quoted strings");
# - Multi-line console.log statements
pattern = r'console\.log\([^;]+\);?'
content = re.sub(pattern, '', content, flags=re.MULTILINE | re.DOTALL)

# Clean up any resulting empty lines or extra whitespace
lines = content.split('\n')
cleaned_lines = []
for line in lines:
    # Keep the line if it's not just whitespace or if it has content
    if line.strip() or (cleaned_lines and cleaned_lines[-1].strip()):
        cleaned_lines.append(line)

# Join lines back and ensure we don't have multiple consecutive empty lines
content = '\n'.join(cleaned_lines)
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

# Write the cleaned file
with open('/Users/olu/code/litebible/src/script.js', 'w') as f:
    f.write(content)

print("✅ Removed all console.log statements from production build")
print("📦 Script is now optimized for production deployment")