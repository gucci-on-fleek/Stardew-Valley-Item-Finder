#!/bin/sh

# Stardew Valley Item Finder
# https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
# SPDX-License-Identifier: MPL-2.0+
# SPDX-FileCopyrightText: 2020 gucci-on-fleek


# This script is to be run only from the Dockerfile. See the url above for more info.

set -e # Fail the entire build if any command fails

install_dependencies () { 
    sudo npm i -g csso-cli terser html-minifier # csso to minify CSS, terser to minify JS, and html-minifier to minify HTML
    sudo apt install minify # to minify the XSLT
}

unique_cache_name () {
    sed -i 's/^const version.*$/const version="'"$GITHUB_RUN_ID"'"/' service-worker.js # The service worker will only update the cache if its version is changed
}

use_minified () {
    sed -i 's/item-finder.js/item-finder.min.js/; s/service-worker.js/service-worker.min.js/; s/item-finder.css/item-finder.min.css/' index.html service-worker.js item-finder.js
    sed -i 's/items.xslt/items.min.xslt/; s/items-to-csv.xslt/items-to-csv.min.xslt/; s/price-adjustments.xslt/price-adjustments.min.xslt/' service-worker.js item-finder.js
}

minify_js () {
    terser item-finder.js -c unsafe=true -m "toplevel=true, reserved=['csv_string', 'file_opened', 'filter_table', 'download_as_csv']" --mangle-props 'regex = /template/' --source-map "url=item-finder.min.js.map" --output item-finder.min.js
    terser service-worker.js --source-map "url=service-worker.min.js.map" --output service-worker.min.js
}

minify_css () {
    csso item-finder.css --source-map file --output item-finder.min.css
}

minify_xslt () {
    minify --type=xml -o items.min.xslt items.xslt
    minify --type=xml -o items-to-csv.min.xslt items-to-csv.xslt
    minify --type=xml -o price-adjustments.min.xslt price-adjustments.xslt
}

minify_html () {
    html-minifier index.html --collapse-boolean-attributes --collapse-inline-tag-whitespace --collapse-whitespace --conservative-collapse --decode-entities --html5 --include-auto-generated-tags --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes -o index.html
}

minify () {
    use_minified
    minify_js
    minify_css
    minify_xslt
    minify_html
}

github_build () {
    install_dependencies
    unique_cache_name
    minify
}


echo "$1"
$1
