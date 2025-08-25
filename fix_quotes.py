#!/usr/bin/env python3
"""
Скрипт для исправления испорченных кавычек в импортах
Восстанавливает правильный JavaScript синтаксис
"""

import os
import re
import glob

def fix_quotes_in_file(file_path):
    """Исправляет кавычки в одном файле"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Исправляем экранированные одинарные кавычки в импортах
        content = re.sub(
            r'from \'([^\']+)\'',
            r'from \'\1\'',
            content
        )
        
        # Исправляем экранированные одинарные кавычки в импортах
        content = re.sub(
            r'import \'([^\']+)\'',
            r'import \'\1\'',
            content
        )
        
        # Исправляем экранированные одинарные кавычки в импортах
        content = re.sub(
            r'import \{([^}]+)\} from \'([^\']+)\'',
            r'import {\1} from \'\2\'',
            content
        )
        
        # Если файл изменился, записываем обратно
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Исправлен: {file_path}")
            return True
        else:
            print(f"⏭️  Без изменений: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка в файле {file_path}: {e}")
        return False

def main():
    """Основная функция"""
    print("🔧 Начинаю исправление кавычек...")
    
    # Находим все JS/JSX файлы
    js_files = glob.glob("frontend/src/**/*.js", recursive=True)
    jsx_files = glob.glob("frontend/src/**/*.jsx", recursive=True)
    all_files = js_files + jsx_files
    
    print(f"📁 Найдено файлов: {len(all_files)}")
    
    fixed_count = 0
    
    for file_path in all_files:
        if fix_quotes_in_file(file_path):
            fixed_count += 1
    
    print(f"\n🎉 Готово! Исправлено файлов: {fixed_count}")
    print(f"📊 Всего проверено: {len(all_files)}")

if __name__ == "__main__":
    main()
