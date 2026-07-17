#!/usr/bin/env python3
"""
Script para convertir DOCUMENTACION_COMPLETA.md a PDF
Uso: python generar_pdf.py
"""

import os
import sys

# Intenta usar pandoc si está disponible
try:
    import subprocess
    
    # Verificar si pandoc está instalado
    result = subprocess.run(['pandoc', '--version'], capture_output=True)
    if result.returncode == 0:
        print("✅ Pandoc encontrado. Generando PDF...")
        
        input_file = 'DOCUMENTACION_COMPLETA.md'
        output_file = 'DOCUMENTACION_COMPLETA.pdf'
        
        cmd = [
            'pandoc',
            input_file,
            '-o', output_file,
            '--from=markdown',
            '--to=pdf',
            '--variable', 'geometry:margin=1in',
            '--variable', 'fontsize:11pt',
            '--variable', 'linestretch:1.5',
            '--table-of-contents',
            '--toc-depth=2',
            '--pdf-engine=xelatex'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ PDF generado exitosamente: {output_file}")
            print(f"📄 Ubicación: {os.path.abspath(output_file)}")
        else:
            print(f"❌ Error al generar PDF: {result.stderr}")
    else:
        print("❌ Pandoc no está instalado")
        print("   Opciones para instalar:")
        print("   - Windows: choco install pandoc")
        print("   - Linux: sudo apt-get install pandoc")
        print("   - Mac: brew install pandoc")
        sys.exit(1)

except FileNotFoundError:
    print("❌ Pandoc no encontrado en PATH")
    print("\n📌 ALTERNATIVAS PARA GENERAR PDF:")
    print("\n1️⃣  Usar VS Code Extension:")
    print("   - Instala: 'Markdown to PDF'")
    print("   - Click derecho en DOCUMENTACION_COMPLETA.md")
    print("   - Selecciona 'Markdown: Export to PDF'")
    
    print("\n2️⃣  Usar servicio online:")
    print("   - https://markdowntopdf.com")
    print("   - Sube DOCUMENTACION_COMPLETA.md")
    print("   - Descarga el PDF")
    
    print("\n3️⃣  Instalar Pandoc:")
    print("   Windows: choco install pandoc miktex")
    print("   Linux:   sudo apt-get install pandoc texlive-latex-base")
    print("   Mac:     brew install pandoc basictex")
    
    sys.exit(1)
