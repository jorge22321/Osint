# PowerShell Script para generar PDF de la documentación
# Uso: .\generar_pdf.ps1

Write-Host "🎁 Generador de PDF - Documentación del Proyecto OSINT" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
$archivoMarkdown = "DOCUMENTACION_COMPLETA.md"
if (-not (Test-Path $archivoMarkdown)) {
    Write-Host "❌ Error: No se encontró $archivoMarkdown" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script en: d:\git_2024\Osint\" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archivo Markdown encontrado: $archivoMarkdown" -ForegroundColor Green
Write-Host ""

# Opción 1: Intentar con Pandoc
Write-Host "1️⃣  Intentando usar Pandoc..." -ForegroundColor Yellow
$pandocPath = (Get-Command pandoc -ErrorAction SilentlyContinue)

if ($pandocPath) {
    Write-Host "✅ Pandoc encontrado: $($pandocPath.Source)" -ForegroundColor Green
    Write-Host "   Generando PDF..." -ForegroundColor Cyan
    
    $outputFile = "DOCUMENTACION_COMPLETA.pdf"
    
    & pandoc $archivoMarkdown `
        -o $outputFile `
        --from=markdown `
        --to=pdf `
        --variable geometry:margin=1in `
        --variable fontsize:11pt `
        --variable linestretch:1.5 `
        --table-of-contents `
        --toc-depth=2 `
        --pdf-engine=xelatex `
        2>&1
    
    if (Test-Path $outputFile) {
        Write-Host "✅ PDF generado exitosamente!" -ForegroundColor Green
        Write-Host "📄 Archivo: $outputFile" -ForegroundColor Green
        Write-Host "📍 Ubicación: $(Resolve-Path $outputFile)" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 El PDF está listo. Puedes abrirlo con cualquier lector de PDF." -ForegroundColor Green
        
        # Intentar abrir automáticamente
        Write-Host ""
        Write-Host "¿Deseas abrir el PDF ahora? (S/N)" -ForegroundColor Yellow
        $response = Read-Host
        
        if ($response -eq 'S' -or $response -eq 's') {
            & explorer.exe $outputFile
            Write-Host "📖 Abriendo PDF..." -ForegroundColor Cyan
        }
        exit 0
    } else {
        Write-Host "❌ Error al generar PDF" -ForegroundColor Red
        Write-Host "   Verifica que LaTeX esté instalado" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Pandoc no está instalado" -ForegroundColor Red
    Write-Host ""
}

# Opción 2: Ofrecer alternativas
Write-Host ""
Write-Host "2️⃣  Alternativas para generar PDF:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   📌 OPCIÓN A: Usar VS Code (Recomendado)" -ForegroundColor Cyan
Write-Host "      1. Instala extensión 'Markdown to PDF'" -ForegroundColor Gray
Write-Host "      2. Click derecho en $archivoMarkdown" -ForegroundColor Gray
Write-Host "      3. Selecciona 'Markdown PDF: Export to PDF'" -ForegroundColor Gray
Write-Host ""

Write-Host "   📌 OPCIÓN B: Instalar Pandoc y reintentar" -ForegroundColor Cyan
Write-Host "      Ejecuta: choco install pandoc miktex" -ForegroundColor Gray
Write-Host "      Luego:   .\generar_pdf.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "   📌 OPCIÓN C: Usar servicio online" -ForegroundColor Cyan
Write-Host "      1. Ve a: https://markdowntopdf.com" -ForegroundColor Gray
Write-Host "      2. Abre $archivoMarkdown en editor" -ForegroundColor Gray
Write-Host "      3. Copia todo el contenido" -ForegroundColor Gray
Write-Host "      4. Pega en la herramienta online" -ForegroundColor Gray
Write-Host "      5. Descarga el PDF" -ForegroundColor Gray
Write-Host ""

Write-Host "   📌 OPCIÓN D: Seguir instrucciones en COMO_GENERAR_PDF.md" -ForegroundColor Cyan
Write-Host "      Archivo: COMO_GENERAR_PDF.md" -ForegroundColor Gray
Write-Host ""

# Preguntar si instalar Pandoc
Write-Host "¿Deseas instalar Pandoc automáticamente? (S/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'S' -or $response -eq 's') {
    Write-Host ""
    Write-Host "⚠️  Nota: Necesitas Chocolatey instalado" -ForegroundColor Yellow
    Write-Host "   Si no lo tienes, instálalo de: https://chocolatey.org/install" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Instalando Pandoc..." -ForegroundColor Cyan
    choco install pandoc miktex -y
    
    Write-Host ""
    Write-Host "✅ Pandoc instalado. Reintentando generación..." -ForegroundColor Green
    Write-Host ""
    
    & .\generar_pdf.ps1
} else {
    Write-Host ""
    Write-Host "📄 Documento Markdown disponible en:" -ForegroundColor Cyan
    Write-Host "   $archivoMarkdown" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usa cualquiera de las opciones anteriores para generar el PDF." -ForegroundColor Yellow
}
