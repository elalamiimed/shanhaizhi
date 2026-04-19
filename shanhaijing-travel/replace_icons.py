import re

file_path = r'c:\Users\hp\OneDrive\Desktop\Full HACK\shanhaijing-travel\js\ui.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace escaped strings
content = content.replace(r"'\uD83C\uDFAB'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"></line><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"></line><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"></line></svg>'")
content = content.replace(r"'\uD83C\uDF5C'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M18 8h1a4 4 0 0 1 0 8h-1\"></path><path d=\"M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z\"></path><line x1=\"6\" y1=\"1\" x2=\"6\" y2=\"4\"></line><line x1=\"10\" y1=\"1\" x2=\"10\" y2=\"4\"></line><line x1=\"14\" y1=\"1\" x2=\"14\" y2=\"4\"></line></svg>'")
content = content.replace(r"'\uD83D\uDDFB'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M8 3l4 8 5-5 5 15H2L8 3z\"/></svg>'")

# ui.js icons for tutorial
content = content.replace(r"'\uD83E\uDD8C'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z\"/></svg>'")
content = content.replace(r"'\uD83D\uDDFA\uFE0F'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polygon points=\"3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21\"/></svg>'")
content = content.replace(r"'\uD83D\uDCF8'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/></svg>'")
content = content.replace(r"'\uD83C\uDFA8'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c4.41 0 8-3.59 8-8 0-1.1-.9-2-2-2h-1.5c-.55 0-1-.45-1-1 0-.28.11-.53.29-.71.18-.18.29-.43.29-.71 0-1.1-.9-2-2-2h-2c-2.76 0-5-2.24-5-5 0-.55.45-1 1-1z\"/></svg>'")
content = content.replace(r"'\uD83C\uDCCF'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"2\" y=\"4\" width=\"12\" height=\"16\" rx=\"2\" ry=\"2\"/><path d=\"M16 4h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-4\"/></svg>'")
content = content.replace(r"'\u2728'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z\"/></svg>'")

# the elements in ui.js
content = content.replace(r"'\uD83C\uDF0D'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>'")
content = content.replace(r"'\uD83D\uDD25'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2c0 0-5 6-5 11a5 5 0 0 0 10 0c0-5-5-11-5-11z\"/></svg>'")
content = content.replace(r"'\uD83D\uDCA7'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2l4 8c2 3 0 7-4 7s-6-4-4-7z\"/></svg>'")
content = content.replace(r"'\u2744\uFE0F'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2v20M2 12h20M5 5l14 14M19 5L5 19\"/></svg>'")
content = content.replace(r"'\uD83D\uDC8E'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M6 2l12 0 4 6-10 14L2 8z\"/></svg>'")
content = content.replace(r"'\uD83C\uDF2C\uFE0F'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M2 12h16c2 0 4-2 4-4s-2-4-4-4M2 16h12c2 0 4 2 4 4s-2 4-4 4\"/></svg>'")
content = content.replace(r"'\uD83C\uDF11'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/></svg>'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix data.js
data_file = r'c:\Users\hp\OneDrive\Desktop\Full HACK\shanhaijing-travel\js\data.js'
with open(data_file, 'r', encoding='utf-8') as f:
    data_content = f.read()

data_content = data_content.replace("'🏔️'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M8 3l4 8 5-5 5 15H2L8 3z\"/></svg>'")
data_content = data_content.replace("'🍜'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M18 8h1a4 4 0 0 1 0 8h-1\"></path><path d=\"M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z\"></path></svg>'")
data_content = data_content.replace("'☀️'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"5\"/></svg>'")
data_content = data_content.replace("'🌊'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M2 12h20M2 18h20\"/></svg>'")
data_content = data_content.replace("'⛰️'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M8 3l4 8 5-5 5 15H2L8 3z\"/></svg>'")
data_content = data_content.replace("'🗺️'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polygon points=\"3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21\"/></svg>'")
data_content = data_content.replace("'🌏'", "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>'")

with open(data_file, 'w', encoding='utf-8') as f:
    f.write(data_content)

# Fix index.html
html_file = r'c:\Users\hp\OneDrive\Desktop\Full HACK\shanhaijing-travel\index.html'
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

html_content = html_content.replace("🔊", "<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"/><path d=\"M15.54 8.46a5 5 0 0 1 0 7.07\"/><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14\"/></svg>")
html_content = html_content.replace("⚙️", "<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z\"/></svg>")
html_content = html_content.replace("🧭", "<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polygon points=\"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76\"/></svg>")

# Maybe there is a ? instead of 🧭?
html_content = html_content.replace("�", "<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polygon points=\"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76\"/></svg>")


with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Done")
