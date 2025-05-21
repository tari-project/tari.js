#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "Finding all package.json files and extracting versions..."

declare -a versions

# Find all package.json files, excluding node_modules, and extract the version
while IFS= read -r file; do
    version=$(jq -r '.version' "$file")
    if [[ -z "$version" || "$version" == "null" ]]; then
        echo "::error::Could not find 'version' field in $file"
        exit 1
    fi
    echo "Found version '$version' in $file"
    versions+=("$version")
done < <(find . -name 'package.json' -not -path '*/node_modules/*')

if [ ${#versions[@]} -eq 0 ]; then
    echo "Error: No package.json files with a 'version' field were found."
    exit 1
fi

reference_version=${versions[0]}
echo "Reference version: $reference_version"

all_same=true
for version in "${versions[@]}"; do
    if [ "$version" != "$reference_version" ]; then
        echo "Error: Mismatched version found! '$version' does not match '$reference_version'."
        all_same=false
        break
    fi
done

if [ "$all_same" = false ]; then
    echo "::error::All package.json versions are NOT the same. Please unify them."
    exit 1
else
    echo "All package.json versions are consistent: $reference_version"
fi
