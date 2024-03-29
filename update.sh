# updating the build directly from github:MRjs:main's dist folder

rm -rf dist
mkdir dist

# Correct variable name and syntax for array declaration
files_list=("mr.js" "57cf7fc5ff4d6dfc74e4.module.wasm" "vendors-node_modules_dimforge_rapier3d_rapier_js.mr.js")

# Correct variable name in the loop
for str in "${files_list[@]}"; do
  echo "Updating build file: $str"
  curl -o dist/${str} https://raw.githubusercontent.com/Volumetrics-io/mrjs/main/dist/${str}
done

# to grab which commit this was from for easier versioning checking
# --- for this one let me know if you have issues with jq, there's a
# --- python way to do this instead as well.

# Check for jq and use it if available
if command -v jq >/dev/null 2>&1; then
    echo "dist build files re-added from:"
    echo $(curl -s "https://api.github.com/repos/Volumetrics-io/mrjs/branches/main" | jq -r '.commit.sha')
else
    echo "jq is not installed. Cannot extract commit SHA."
    # Python alternative can be provided here if needed
fi
