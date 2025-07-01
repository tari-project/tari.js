#!/usr/bin/env bash

set -euo pipefail

# This script cleans up the dist and node_modules directories in all packages

gitroot=$(git rev-parse --show-toplevel)
pushd "${gitroot}" > /dev/null
echo "Cleaning up the root node_modules"
rm -fr node_modules
popd > /dev/null

pushd "${gitroot}/packages" > /dev/null

# Loop through all subdirectories
for dir in */; do
    if [ -d "$dir" ]; then
        echo "Cleaning up $dir"
        # Remove dist directory if it exists
        if [ -d "${dir}dist" ]; then
            echo "Removing ${dir}dist"
            rm -rf "${dir}dist"
        fi
        # Remove node_modules directory if it exists
        if [ -d "${dir}node_modules" ]; then
            echo "Removing ${dir}node_modules"
            rm -rf "${dir}node_modules"
        fi
        # Remove tsconfig.tsbuildinfo file if it exists
        if [ -f "${dir}tsconfig.tsbuildinfo" ]; then
            echo "Removing ${dir}tsconfig.tsbuildinfo"
            rm -f "${dir}tsconfig.tsbuildinfo"
        fi
    fi
done

echo "Cleanup complete."
popd > /dev/null