import re

file_path = r'c:\Users\hp\OneDrive\Desktop\Full HACK\shanhaijing-travel\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find <g id="features"> and remove until </svg>
new_content = re.sub(r'<g id="features">.*?</svg>', '', content, flags=re.DOTALL)
# also remove the orphaned <template> if it's there
new_content = re.sub(r'<template id="china-map-svg-template">.*?</template>', '', new_content, flags=re.DOTALL)
new_content = re.sub(r'<!-- 中国矢量地图SVG.*?避免fetch依赖） -->', '', new_content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done. Matched:", content != new_content)
