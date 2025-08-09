#!/usr/bin/env python3

import json

# Load the full Bible data
with open('/Users/olu/code/litebible/BSB.ultra.json', 'r') as f:
    bible = json.load(f)

# Find Gospel of John (index 42)
john = bible[42]

# Generate the JavaScript file content
js_content = """// Initial Bible data for fast loading - Complete John chapters
export default [
  ["John", ["""

# Add John 1
js_content += '\n    // John 1\n    [\n'
for i, verse in enumerate(john[1][0]):
    escaped = verse.replace('"', '\\"')
    comma = ',' if i < len(john[1][0]) - 1 else ''
    js_content += f'      "{escaped}"{comma}\n'
js_content += '    ],'

# Add John 2
js_content += '\n    // John 2\n    [\n'
for i, verse in enumerate(john[1][1]):
    escaped = verse.replace('"', '\\"')
    comma = ',' if i < len(john[1][1]) - 1 else ''
    js_content += f'      "{escaped}"{comma}\n'
js_content += '    ],'

# Add John 3
js_content += '\n    // John 3\n    [\n'
for i, verse in enumerate(john[1][2]):
    escaped = verse.replace('"', '\\"')
    comma = ',' if i < len(john[1][2]) - 1 else ''
    js_content += f'      "{escaped}"{comma}\n'
js_content += '    ]'

js_content += """
  ]]
];"""

# Write to the file
with open('/Users/olu/code/litebible/src/bible-initial.js', 'w') as f:
    f.write(js_content)

print(f"✅ Updated bible-initial.js with complete John chapters:")
print(f"   John 1: {len(john[1][0])} verses (was 8)")
print(f"   John 2: {len(john[1][1])} verses (was 4)")
print(f"   John 3: {len(john[1][2])} verses (was 4)")