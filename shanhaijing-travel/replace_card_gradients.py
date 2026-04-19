import re

file_path = r'c:\Users\hp\OneDrive\Desktop\Full HACK\shanhaijing-travel\js\ui.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the array of _cardGradients
new_gradients = """  var _cardGradients = [
    'linear-gradient(135deg, #F5F0E8 0%, #E8E0D0 40%, #D8CDB8 70%, #C4B59D 100%)',
    'linear-gradient(135deg, #E6E6FA 0%, #D8D8E8 30%, #C0C0D8 60%, #A8A8C8 100%)',
    'linear-gradient(135deg, #F0FFF0 0%, #E0F0E0 30%, #C8D8C8 60%, #B0C0B0 100%)',
    'linear-gradient(135deg, #FFF0F5 0%, #F0E0E5 30%, #D8C8CD 60%, #C0B0B5 100%)',
    'linear-gradient(135deg, #FFFFF0 0%, #F0F0E0 30%, #D8D8C8 60%, #C0C0B0 100%)',
    'linear-gradient(135deg, #FDF5E6 0%, #EAE0D0 30%, #D0C5B5 60%, #B5A898 100%)',
    'linear-gradient(135deg, #F0FFFF 0%, #E0F0F0 30%, #C8D8D8 60%, #B0C0C0 100%)',
    'linear-gradient(135deg, #F5FFFA 0%, #E5F0E8 30%, #CDD8D0 60%, #B5C0B8 100%)'
  ];"""

content = re.sub(r'var _cardGradients = \[.*?\];', new_gradients, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
