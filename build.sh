#!/bin/sh

# Stardew Valley Item Finder
# https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
# SPDX-License-Identifier: MPL-2.0+
# SPDX-FileCopyrightText: 2021 gucci-on-fleek

set -e # Fail the entire build if any command fails

install_dependencies () { 
    sudo npm i -g csso-cli terser html-minifier svgo
    sudo apt install minify pngcrush zopfli jq --no-install-recommends -y

    wget "https://github.com/RazrFalcon/svgcleaner/releases/download/v0.9.5/svgcleaner_linux_x86_64_0.9.5.tar.gz"
    tar xf svgcleaner* -C ~
    rm svgcleaner*

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

minify_svg () {
    for i in $(seq 5); do # svgcleaner needs to be ran 5 times for the smallest size
        ~/svgcleaner assets/"$1" assets/"$1" --remove-invisible-elements
    done
    svgo assets/"$1" # svgo needs to be ran twice for the smallest size
    svgo assets/"$1"
}

use_minified () {
    sed -i 's|src/|dist/|g' dist/*
    sed -i 's|\.\./|./|g; ' dist/index.html
}

minify () {
    parallel_exec '*.css' minify_css
    parallel_exec '*.html' minify_html
    parallel_exec '*.xslt' minify_xml
    parallel_exec '*.js' minify_js
    parallel_exec '*.webmanifest' minify_json
    parallel_exec '*.png' minify_png
    parallel_exec '*.svg' minify_svg
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
    mv dist/index.html ./index.html
}

echo "** $1 **"
$1 "$2" "$3"
