'use strict';
/* Stardew Valley Item Finder
 * https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
 * Licensed under MPL 2.0 or greater. See URL for more information.
 */


let template
window.onload = function (e) {
    const __template = {
        table: document.getElementById('table_base'),
        cell: document.getElementById('cell_base'),
        row: document.getElementById('row_base'),
        header_cell: document.getElementById('header_cell_base'),
        header: document.getElementById('header_base'),
        silver: document.getElementById('silver_base'),
        gold: document.getElementById('gold_base'),
        iridium: document.getElementById('iridium_base'),
    }
    /**
     * Object that produces the HTML template
     * @param x - The text/nodes to include in the template (Not for all elements)
     * @returns {DocumentFragment} An element containing the template
     * @effects None
     */
    template = {
        table: () => __template.table.content.cloneNode(true).firstElementChild, // Creates an empty table
        header_cell: function (x) { // Creates each header cell
            const clone = __template.header_cell.content.cloneNode(true)
            clone.firstElementChild.insertAdjacentHTML('beforeend', x)
            return clone
        },
        header: function (x) { // Creates the header row
            const clone = __template.header.content.cloneNode(true)
            clone.firstElementChild.appendChild(x)
            return clone
        }, /* Produces the quality images */
        silver: () => __template.silver.content.cloneNode(true),
        gold: () => __template.gold.content.cloneNode(true),
        iridium: () => __template.iridium.content.cloneNode(true),
    }
}

/**
 * Handle the user opening a file
 * @param {Event} event - The event
 * @remarks Triggered by the file input
 * @effects Modifies the `#table_container` DOM element
 */
function file_opened(event) {
    const input = event.target;
    const reader = new FileReader();

    reader.onload = function () {
        const file_contents = reader.result;

        const save_game = parse_xml(file_contents)
        get_files(["items.xslt", "items-to-csv.xslt"]).then(
            function (requests) {
                let table = template.table()
                const items = process_xslt(parse_xml(requests[0]), save_game);
                const csv = process_xslt(parse_xml(requests[1]), items)

                const csv_array = csv_to_array(xslt_output_to_text(csv));
                table = make_html_table(csv_array, table);
                table = make_header(csv_array, table);
                set_output(table);
                enable_table_sort();
            })
    };
    reader.readAsText(input.files[0]);
};


/**
 * Parse a string as `XML`
 * @param {String} text - The string to parse as `XML`
 * @returns {XMLDocument} A `DOM` object representing the input `XML`
 * @effects None
 */
function parse_xml(text) {
    const xml_parser = new DOMParser();
    return xml_parser.parseFromString(text, "text/xml")
}


/**
 * Download an array of URLs
 * @param {String[]} paths - An array of URLs to fetch
 * @returns {Promise} A promise holding the text for each request
 * @effects Initiates a network request to download the URLs
 */
function get_files(paths) {
    let requests = []
    for (let i = 0; i < paths.length; i++) {
        requests.push(fetch(paths[i]).then(x => x.text()))
    }

    return Promise.all(requests)
}


/**
 * Transform the `XML`
 * @param {DocumentFragment} xslt - The `XSLT` used for the transformation
 * @param {DocumentFragment} xml - The `XML` to transform
 * @returns {DocumentFragment} The transformed `XML`
 * @effects None
 */
function process_xslt(xslt, xml) {
    const xslt_processor = new XSLTProcessor();

    xslt_processor.importStylesheet(xslt);
    const processed = xslt_processor.transformToFragment(xml, new Document()); // Non-standard, but supported by everything that isn't IE

    return processed;
}


let csv_string; // Global, holds the CSV so that it can later be downloaded
/**
 * Convert the `XSLT` transformed output into a string
 * @param {DocumentFragment} xml - The `XML` to convert to a string
 * @returns {String} A string representing the `XML`'s contents
 * @remarks `XSLT` transform a document into another `XML` document
 *          or plain text, however, the `XSLTProcessor` object always
 *          returns an `XMLDocument` object. Since we are transforming
 *          the `CSV` into plain text, we need to call this function
 *          to get a string.
 * @effects Modifies global variable `csv_string`
 */
function xslt_output_to_text(xml) {
    csv_string = xml.firstChild.wholeText;  // Easiest way to get the xslt-transformed text
    return csv_string
}


/**
 * Parse the `CSV` file into an array
 * @param {String} csv - The `CSV` file
 * @returns {Array(String)} - An array representing the `CSV`
 * @remarks This is a very basic `CSV` parser. It just splits on
 *          commas and newlines, so any edge cases **will not** be
 *          accounted for. However, there won't be any edge cases
 *          since we control the input `CSV`.
 * @effects None
 */
function csv_to_array(csv) {
    return csv.split('\n').map(x => x.split(',')) // We made the csv file, so there won't be any edge cases
}


/**
 * Adds text to an `HTML` element
 * @param {HTMLTableCellElement } cell - The cell to add the text
 * @param {String} text - The text to add
 * @returns {function} A function that adds the text when called
 * @remarks Returns a function to make *this* function side-effect free.
 * @effects None
 */
function cell_text(cell, text) {
    return () => cell.appendChild(document.createTextNode(text))
}


/**
 * Converts the array into the `HTML` table
 * @param {String[]} array - The array to make into a table
 * @param {DocumentFragment} table - The document fragment to make the table in
 * @returns {String} The input array as an `HTML` table
 * @effects None
 */
function make_html_table(array, table) {
    for (let i = 1; i < array.length - 1; i++) {
        const row = table.insertRow()

        for (let j = 0; j < array[i].length; j++) {
            const cell = row.insertCell()
            if (j === 1) { // Quality column
                cell.appendChild(replace_icon(array[i][j]));
                continue;
            }
            cell_text(cell, format_integer(array[i][j]))()
        }
    }
    return table;
}


/**
 * Extracts the header from the array and returns and `HTML` table header
 * @param {String[]} array - The array to make into a header
 * @param {DocumentFragment} table - The document fragment to make the table in
 * @returns {String} The input array as an `HTML` table header
 * @effects None
 */
function make_header(array, table) {
    let html = new DocumentFragment;
    for (let j = 0; j < array[0].length; j++) {
        html.append(template.header_cell(array[0][j]))
    }
    table.tHead.appendChild(template.header(html))
    return table
}


/**
 * Replace quality names with their corresponding icon
 * @param {"Silver"|"Gold"|"Iridium"|""} quality_name - The quality name (Silver, Gold, or Iridium)
 * @returns {String} An `HTML` fragment containing a star icon
 * @remarks Uses the Stardew Valley icons for qualities
 * @effects None
 */
function replace_icon(quality_name) {
    switch (quality_name) {
        case "Silver":
            return template.silver()
        case "Gold":
            return template.gold()
        case "Iridium":
            return template.iridium()
        default:
            return document.createTextNode('')
    }
}


/**
 * Format an integer so that it is human-readable
 * @param {String|Number} number - The integer to format
 * @remarks Separate the thousands by a thin space
 * @effects None
 */
function format_integer(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}


let previous_output = false
/**
 * Put the table's `HTML` into the document
 * @param {String} html - The `HTML` fragment to add to the document
 * @effects Modifies DOM element `#table_container`. Modifies global variable `previous_output`.
 */
function set_output(table) {
    document.querySelector('article').style.display = 'none' // Hide the container

    if (previous_output) { // Remove old table
        document.getElementById('item_table').remove()
    }
    table = calculate_sum(table);

    const container = document.getElementById('table_container');
    container.appendChild(table)

    document.querySelector('article').style.removeProperty('display') // Show the container
    previous_output = true
    document.getElementById('filter').focus();
}


/**
 * Strip the thin space added by `format_integer()`
 * @param {String} number - A string containing a number
 * @returns {Number} The integer found, or 0 otherwise
 * @remarks Just concatenates all numerals found in a string
 * @effects None
 */
function parse_integer(number) {
    const match = number.match(/\d/g);
    return match ? Number(match.join('')) : 0
}


/**
 * Show the table sums in its footer
 * @param {DocumentFragment} table - The document fragment to sum
 * @effects None
 */
function calculate_sum(table) {
    const foot = table.tFoot
    let tot_price = 0;
    let tot_count = 0;
    const current_hidden_filter_class = `filter_${filter_class}`;

    while (foot.rows[0]) { // Remove old footers
        foot.rows[0].remove()
    }

    for (let i = 0, row; row = table.tBodies[0].rows[i]; i++) {
        if (row.classList.contains(current_hidden_filter_class)) { continue; } // Skip if hidden by filter
        tot_count += parse_integer(row.cells[3].textContent);
        tot_price += parse_integer(row.cells[5].textContent);
    }

    const row = foot.insertRow()
    const blank = () => cell_text(row.insertCell(), (""))()

    cell_text(row.insertCell(), "Total")()
    blank()
    blank()
    cell_text(row.insertCell(), format_integer(tot_count))()
    blank()
    cell_text(row.insertCell(), format_integer(tot_price))()

    return table
}


/**
 * Allow the table to be sorted by clicking on the headings
 * @effects Initializes Tablesort. Adds event listeners to the table headers.
 */
function enable_table_sort() {
    const item_table = document.getElementById('item_table');
    const tablesort = new Tablesort(item_table); // Allow the table headings to be used for sorting

    Tablesort.extend('number', item => item.match(/\d/), // Sort numerically
        (a, b) => parse_integer(a) - parse_integer(b));

    const header_cells = item_table.tHead.rows[0].cells;
    for (let i = 0; i < header_cells.length; i++) {
        header_cells[i].addEventListener('keydown', function (event) {
            /* Allow the keyboard to be used for sorting */
            if (event.key === 'Enter') {
                tablesort.sortTable(event.srcElement)
            }
        })
    }
}


/**
 * Allow the user to download their save as a CSV
 * @param {String} text 
 * @remarks Called by the download button
 * @effects Temporarily modifies DOM. Triggers a download.
 */
function download_as_csv(text) {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', 'Stardew Valley Items.csv')
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


let filter_class = 1;
/** 
 * Allows the table to be filtered
 * @remarks The naïve version of this function directly applied
 *          'display: none' to each row. However, this triggered 
 *          a repaint for each row, since it was removed from display. 
 *          The optimized version of this function applies a new
 *          and unique class to each row whenever a filter is 
 *          applied. Then—and only then—can we hide that class. 
 *          This means that only one repaint is triggered instead
 *          of one for each row. In benchmarks, this is about 250%
 *          faster than the old function.
 * @effects Modifies CSS and the `class` attribute of table rows. Modifies global variable `filter_class`.
 */
function filter_table() {
    const filter = document.getElementById('filter').value;
    const table = document.getElementById('item_table')
    const rows = table.tBodies[0].rows;
    const search = RegExp(filter, 'i');
    const last_filter_class = filter_class - 1; // The class that we're adding
    const last_last_filter_class = last_filter_class - 1; // The class that we're removing
    const filter_class_name = `filter_${filter_class}`;
    const last_last_filter_class_name = `filter_${last_last_filter_class}`;

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        if (!row.textContent.match(search)) {
            row.classList.add(filter_class_name);
        }
        row.classList.remove(last_last_filter_class_name); // Cleanup old filter classes
    }

    const style = document.styleSheets[0];
    style.insertRule(`.${filter_class_name} {display:none}`);
    if (last_last_filter_class >= 0) {
        style.deleteRule(1)
    }

    const new_foot = calculate_sum(table) // Update the footer after the filter is applied

    filter_class++; // Increment the class's name
}
