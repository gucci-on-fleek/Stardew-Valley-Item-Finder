#!/bin/sh

# Stardew Valley Item Finder
# https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
# SPDX-License-Identifier: MPL-2.0+
# SPDX-FileCopyrightText: 2021 gucci-on-fleek

set -e # Fail the entire build if any command fails

install_dependencies () { 
    sudo npm i -g csso-cli terser html-minifier # csso to minify CSS, terser to minify JS, and html-minifier to minify HTML
    sudo apt install minify pngcrush zopfli --no-install-recommends -y # to minify XSLT and PNG

    wget "https://github.com/RazrFalcon/svgcleaner/releases/download/v0.9.5/svgcleaner_linux_x86_64_0.9.5.tar.gz" # to minify SVG
    tar xf svgcleaner* -C ~

}

unique_cache_name () {
    sed -i 's/^const version.*$/const version="'"$GITHUB_RUN_ID"'"/' src/service-worker.js # The service worker will only update the cache if its version is changed
}

use_minified () {
    sed -i 's|src/|dist/|' src/index.html src/service-worker.js src/item-finder.js src/service-worker.js src/item-finder.js
}

minify_js () {
    terser src/item-finder.js -c unsafe=true -m "toplevel=true, reserved=['csv_string', 'file_opened', 'filter_table', 'download_as_csv']" --mangle-props 'regex = /template/' --source-map "url=item-finder.js.map" --output dist/item-finder.js
    terser src/service-worker.js --source-map "url=dist/service-worker.js.map" --output dist/service-worker.js
}

minify_css () {
    csso src/item-finder.css --source-map file --output dist/item-finder.css
}

minify_xslt () {
    command minify --type=xml -o dist/items.xslt src/items.xslt
    command minify --type=xml -o dist/items-to-csv.xslt src/items-to-csv.xslt
    command minify --type=xml -o dist/price-adjustments.xslt src/price-adjustments.xslt
}

minify_html () {
    html-minifier src/index.html --collapse-boolean-attributes --collapse-inline-tag-whitespace --collapse-whitespace --conservative-collapse --decode-entities --html5 --include-auto-generated-tags --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes -o index.html
}

minify_one_png () {
    pngcrush -ow -rem gAMA -rem cHRM -rem bKGD -rem tIME -rem tEXt -rem TRRd "$1" # Remove extra data in png files
    zopflipng -y -m --lossy_transparent "$1" "$1" # Bruteforce compress the png
}

minify_one_svg () {
    for i in $(seq 5); do # For some reason, svgcleaner needs to be ran multiple times for the best results
        ~/svgcleaner "$1" "$1" --remove-invisible-elements
    done
}

minify_images () {
    # Recursively minify all images
    find . -name "*.png" -exec "$0" minify_one_png {} \;
    find . -name "*.svg" -exec "$0" minify_one_svg {} \;
}

minify () {
    use_minified
    minify_js
    minify_css
    minify_xslt
    minify_html
    minify_images
}

github_build () {
    install_dependencies
    unique_cache_name
    minify
}

docker_build () {
    apt update
    apt install sudo
    apt install npm wget --no-install-recommends -y
    install_dependencies
    minify
}


echo "$1"
$1 "$2"
