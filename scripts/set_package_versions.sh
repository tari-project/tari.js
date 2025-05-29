#!/bin/bash
set -euo pipefail

# This script sets the package versions in all package.json files for the workspace.

# Usage: ./scripts/set_package_versions.sh <version>
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

gitroot=$(git rev-parse --show-toplevel)

VERSION=$1
# Find all package.json files in the workspace
pushd "${gitroot}/packages" > /dev/null
find . -depth -maxdepth 2 -name 'package.json' | while read -r package_json; do
    # Update the version in the package.json file
    jq --arg version "$VERSION" '.version = $version' "$package_json" > "$package_json.tmp" && mv "$package_json.tmp" "$package_json"
    echo "Updated version in $package_json to $VERSION"
done
popd > /dev/null

pushd "${gitroot}/docusaurus/tari-docs" > /dev/null
jq --arg version "$VERSION" '.version = $version' package.json > package.json.tmp && mv package.json.tmp package.json
echo "Updated docusaurus package.json version to $VERSION"
popd > /dev/null

pushd "${gitroot}" > /dev/null
# Update the version in the root package.json
jq --arg version "$VERSION" '.version = $version' package.json > package.json.tmp && mv package.json.tmp package.json
echo "Updated root package.json version to $VERSION"

pnpm install

echo "Running check_versions script to verify versions..."
./scripts/check_versions.sh
popd > /dev/null

