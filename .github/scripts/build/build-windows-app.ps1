$ErrorActionPreference = "Stop"

$TAG_NAME = $env:GITHUB_REF_NAME
$RELEASE_NAME = "Release $TAG_NAME"
$RELEASE_BODY = "Automated build generated via workflow."
$REPO = "pedroaba/treenshoter"
$ASSET_DIR = "./dist"   # Altere se necessário

# 1. Verifica autenticação do GitHub CLI (opcional)
try {
    gh auth status | Out-Null
} catch {
    Write-Host "⚠️  GitHub CLI is not authenticated! Configure the GITHUB_TOKEN."
    exit 1
}

# 2. Build do projeto
Write-Host "🔧 Iniciando o build com pnpm..."
pnpm build:win

# 3. Criação da release no GitHub (usa a tag já existente)
Write-Host "🚀 Creating GitHub release (if it doesn't exist)..."
try {
    gh release create "$TAG_NAME" `
        --repo "$REPO" `
        --title "$RELEASE_NAME" `
        --notes "$RELEASE_BODY" `
        --latest `
        --verify-tag
} catch {
    Write-Host "⚠️ Release already exists."
}

# 4. Upload dos arquivos de build para a release (pula diretórios)
Write-Host "📤 Uploading build files to release..."
Get-ChildItem -Path $ASSET_DIR | ForEach-Object {
    if ($_.PSIsContainer) {
        Write-Host "skipping dir $($_.FullName)"
    }
    elseif ($_.FullName -match '\.(exe|msi|zip|nupkg)$') {
        Write-Host "Uploading $($_.FullName)..."
        gh release upload "$TAG_NAME" "$($_.FullName)" --repo "$REPO" --clobber
    }
    else {
        Write-Host "Skipping $($_.FullName)"
    }
}

Write-Host "✅ Build and release process completed successfully!"