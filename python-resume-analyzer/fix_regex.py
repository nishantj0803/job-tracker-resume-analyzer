import re

# Read the file
with open('simple_resume_analyzer.py', 'r') as file:
    content = file.read()

# Fix the regex patterns
content = content.replace('r\'\\b\'', 'r\'\b\'')
content = content.replace('r\'(?i)\\b', 'r\'(?i)\b')
content = content.replace('\\.', '\.')

# Write the fixed content back to the file
with open('simple_resume_analyzer.py', 'w') as file:
    file.write(content)

print("Regex patterns fixed!")
