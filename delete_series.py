#!/usr/bin/env python3
import os
import sys

files_to_delete = [
    'src/pages/cocinas/serie-1-gloss.astro',
    'src/pages/cocinas/serie-2-matt.astro',
    'src/pages/cocinas/serie-3-adira.astro',
    'src/pages/cocinas/serie-4-universo.astro',
    'src/pages/cocinas/serie-5-real.astro',
    'src/pages/cocinas/serie-6-stone.astro',
    'src/pages/cocinas/serie-7-fenix.astro',
    'src/pages/cocinas/serie-8-finger-pull.astro',
]

base_path = os.path.dirname(os.path.abspath(__file__))

for file in files_to_delete:
    full_path = os.path.join(base_path, file)
    if os.path.exists(full_path):
        os.remove(full_path)
        print(f"Deleted: {file}")
    else:
        print(f"Not found: {file}")

print("Done!")
