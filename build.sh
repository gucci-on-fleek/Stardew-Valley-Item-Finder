#!/bin/sh

# Stardew Valley Item Finder
# https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
# SPDX-License-Identifier: MPL-2.0+
# SPDX-FileCopyrightText: 2022 Max Chernoff

set -e # Fail the entire build if any command fails

install_dependencies () {
    sudo npm i -g csso-cli terser html-minifier
    sudo apt install minify pngcrush zopfli jq --no-install-recommends -y
}

parallel_exec () {
    find . -type d \( -name 'node_modules' -o -name '.git' \) -prune -o -name "$1" -printf '%f\n' | parallel --will-cite "$0" "$2"
}

minify_css () {
    csso src/"$1" --source-map file --output dist/"$1"
}

minify_html () {
    html-minifier src/"$1" --collapse-boolean-attributes --collapse-whitespace --decode-entities --html5 --include-auto-generated-tags --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes -o dist/"$1"
}

minify_xml () {
    command minify --type=xml -o dist/"$1" src/"$1"
}

minify_js () {
    terser src/"$1" -c unsafe=true -m "toplevel=true" --mangle-props 'regex = /template/' --source-map "url=$1.map" --output dist/"$1"
}

minify_json () {
    jq -c < src/"$1" > dist/"$1"
}

minify_png () {
    pngcrush -ow -rem gAMA -rem cHRM -rem bKGD -rem tIME -rem tEXt -rem TRRd assets/"$1" # Remove extra data in png files
    zopflipng -y -m --lossy_transparent assets/"$1" assets/"$1" # Bruteforce compress the png
}

use_minified () {
    sed -i 's|src/|dist/|g; s|\.\./|./|g' $(find dist/ -name '*.webmanifest' -prune -o -type f -print)
}

minify () {
    parallel --colsep ' ' --will-cite "$0" parallel_exec '{1}' '{2}' <<EOF
*.css minify_css
*.html minify_html
*.xslt minify_xml
*.xsd minify_xml
*.js minify_js
*.webmanifest minify_json
*.png minify_png
EOF
    use_minified
    sed -i 's|dist/|../src/|' dist/*.map # Fix source maps
}

unique_cache_name () {
    sed -i 's/^const version.*$/const version="'"$GITHUB_RUN_ID"'"/' src/service-worker.js # The service worker will only update the cache if its version is changed
}

github_build () {
    install_dependencies
    unique_cache_name
    minify
    mv dist/service-worker.js ./service-worker.js
    mv dist/index.html ./index.html
}

echo "** $1 **"
$1 "$2" "$3"
