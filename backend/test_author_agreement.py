#!/usr/bin/env python
import os
import sys
import django

# Добавляем путь к проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FanVers_project.settings')
django.setup()

from django.conf import settings
import mammoth

def test_author_agreement():
    try:
        # Путь к DOCX файлу
        docx_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'src', 'info', 'legal', 'Договір з автором.docx')
        
        print(f"Checking path: {docx_path}")
        print(f"File exists: {os.path.exists(docx_path)}")
        
        if not os.path.exists(docx_path):
            print("File not found!")
            return
        
        # Простая конвертация без дополнительных опций
        with open(docx_path, "rb") as docx_file:
            result = mammoth.convert_to_html(docx_file)
            html_content = result.value
            
            print(f"Conversion successful!")
            print(f"HTML length: {len(html_content)}")
            print(f"First 200 chars: {html_content[:200]}")
            
            if result.messages:
                print(f"Warnings: {result.messages}")
                
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_author_agreement()
