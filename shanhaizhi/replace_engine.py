import re

file_path = r'c:\Users\hp\OneDrive\Desktop\Full HACK\shanhaijing-travel\js\engine.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all values in BEAST_EMOJI_MAP
generic_beast_icon = "'<svg class=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"/></svg>'"

content = re.sub(r"'\\uD83E\\uDD8C'", generic_beast_icon, content)
content = re.sub(r"'\\uD83E\\uDD8A'", generic_beast_icon, content)
content = re.sub(r"'\\uD83D\\uDC26'", generic_beast_icon, content)
content = re.sub(r"'\\uD83D\\uDC3C'", generic_beast_icon, content)
content = re.sub(r"'\\uD83D\\uDC0D'", generic_beast_icon, content)
content = re.sub(r"'\\uD83D\\uDC09'", generic_beast_icon, content)
content = re.sub(r"'\\uD83D\\uDEE2'", generic_beast_icon, content)
content = re.sub(r"'\\uD83E\\uDD81'", generic_beast_icon, content)
content = re.sub(r"'\\uD83E\\uDD85'", generic_beast_icon, content)
content = re.sub(r"'\\uD83C\\uDF00'", generic_beast_icon, content)
content = re.sub(r"'\\uD83D\\uDC2F'", generic_beast_icon, content)
content = re.sub(r"'\\uD83D\\uDC78'", generic_beast_icon, content)
content = re.sub(r"'\\uD83C\\uDFC3'", generic_beast_icon, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
