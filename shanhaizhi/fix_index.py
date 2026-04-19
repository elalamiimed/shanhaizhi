import re

file_path = r'c:\Users\hp\OneDrive\Desktop\Full HACK\shanhaijing-travel\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_svg = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>?'

replacements = {
    f'相{bad_svg}': '相册',
    f'渲{bad_svg}': '渲染',
    f'容{bad_svg}': '容器',
    f'初{bad_svg}': '初阶',
    f'山海{bad_svg}': '山海经',
    f'内容{bad_svg}': '内容区',
    f'输{bad_svg}': '输入',
    f'游{bad_svg}': '游戏',
    f'启动{bad_svg}': '启动',
    f'未加{bad_svg}': '未加载',
    f'已加{bad_svg}': '已加载',
    f'依{bad_svg}': '依赖',
    f'完成{bad_svg}': '完成',
    f'启{bad_svg}': '启动',
    f'用{bad_svg}': '用',
    f'提{bad_svg}': '提示',
    f'</svg>?': '</svg>'
}

for bad, good in replacements.items():
    content = content.replace(bad, good)

# Fix the fab-icon which should just be the compass SVG
content = content.replace('<div class="fab-icon">?', '<div class="fab-icon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></div>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
