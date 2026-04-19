import re

file_path = r'c:\Users\hp\OneDrive\Desktop\Full HACK\shanhaijing-travel\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find everything from <template id="china-map-svg-template"> to </template>
new_content = re.sub(r'<!-- 中国矢量地图SVG.*?<template id="china-map-svg-template">.*?</template>', '', content, flags=re.DOTALL)
if new_content == content:
    # try just the template tag
    new_content = re.sub(r'<template id="china-map-svg-template">.*?</template>', '', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done. Matched:", content != new_content)
