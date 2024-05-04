#! /bin/bash

rm -rf mrjs-build
mkdir mrjs-build

files_list=("mr.js" "57cf7fc5ff4d6dfc74e4.module.wasm" "vendors-node_modules_dimforge_rapier3d_rapier_js.mr.js")

for str in "${files_list[@]}"; do
  echo "Updating build file: $str"
  curl -o mrjs-build/${str} https://raw.githubusercontent.com/Volumetrics-io/mrjs/main/dist/${str}
done

if command -v jq >/dev/null 2>&1; then
    echo "dist build files re-added from:"
    echo $(curl -s "https://api.github.com/repos/Volumetrics-io/mrjs/branches/main" | jq -r '.commit.sha')
else
    echo "jq is not installed. Cannot extract commit SHA."
fi
