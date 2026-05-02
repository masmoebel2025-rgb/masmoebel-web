#!/bin/bash
# Cleanup script for Section 4 refactor
# Run from project root: bash cleanup.sh

echo "Cleaning up old series files..."

rm -f "src/pages/cocinas/serie-1-gloss.astro"
rm -f "src/pages/cocinas/serie-2-matt.astro"
rm -f "src/pages/cocinas/serie-3-adira.astro"
rm -f "src/pages/cocinas/serie-4-universo.astro"
rm -f "src/pages/cocinas/serie-5-real.astro"
rm -f "src/pages/cocinas/serie-6-stone.astro"
rm -f "src/pages/cocinas/serie-7-fenix.astro"
rm -f "src/pages/cocinas/serie-8-finger-pull.astro"

echo "Cleanup completed!"
echo ""
echo "Git status:"
git status --short
