#!/bin/bash
set -e

TAG_NAME="${GITHUB_REF_NAME}"  # Pega a tag do contexto do GitHub Actions
RELEASE_NAME="Release $TAG_NAME"
RELEASE_BODY="Automated build generated via workflow."
REPO="pedroaba/treenshoter"
ASSET_DIR="./dist"  # Altere se seu build gerar artefatos em outro lugar

# Verifica autenticação do GitHub CLI (opcional)
if ! gh auth status > /dev/null 2>&1; then
  echo "⚠️  GitHub CLI is not authenticated! Configure the GITHUB_TOKEN."
  exit 1
fi

# 1. Build do projeto
echo "🔧 Iniciando o build com pnpm..."
pnpm build:mac

# 2. Criação da release no GitHub (usa a tag já existente)
echo "🚀 Creating GitHub release (if it doesn't exist)..."
gh release create "$TAG_NAME" \
  --repo "$REPO" \
  --title "$RELEASE_NAME" \
  --notes "$RELEASE_BODY" \
  --latest \
  --verify-tag || echo "⚠️ Release already exists."

# 3. Upload dos arquivos de build para a release
echo "📤 Uploading build files to release..."
for file in "$ASSET_DIR"/*; do
  if [ -f "$file" ] && ([[ "$file" == *.dmg ]] || [[ "$file" == *.zip ]]); then
    echo "Uploading $file..."
    gh release upload "$TAG_NAME" "$file" --repo "$REPO" --clobber
  else
    echo "Skipping $file"
  fi
done

echo "✅ Build and release process completed successfully!"