'use strict';

const template = {
    /* Object containing all output HTML strings */
    heading: '<article><h2>Items' +
        '<input type="text" id="filter" class="input" onkeyup="filter_table()" placeholder="Filter" title="Filter" aria-label="Filter Table" ></input>' +
        '</h2>',
    download: (x) => `<input type="button" id="down-button" class="input" value="Download as CSV" onclick="download_as_csv(${x})" />`,
    table: {
        begin: '<table id="item_table">',
        end: '</table></article>',
        cell: (x) => `<td>${x}</td>`,
        header_cell: (x) => `<th tabindex="0">${x}</th>`,
    },
    header: {
        begin: '<thead><tr class="header">',
        end: '</tr></thead>',
    },
    body: {
        begin: '<tbody>',
        end: '</tbody>'
    },
    row: {
        begin: '<tr>',
        end: '</tr>'
    },
    footer: {
        begin: '<tfoot>',
        end: '</tfoot>'
    },
    icons: {
        silver: '<img src="assets/silver_star.png" class="icon" alt="Silver" title="Silver" /><div class="sort-id">1 Silver</div>',
        gold: '<img src="assets/gold_star.png" class="icon" alt="Gold" alt="Gold" title="Gold" /><div class="sort-id">2 Gold</div>',
        iridium: '<img src="assets/iridium_star.png" class="icon" alt="Iridium" title="Iridium" /><div class="sort-id">3 Iridium</div>',
    }
}


function file_opened(event) {
    /* Handle the user opening a file */
    const input = event.target;
    const reader = new FileReader();

    reader.onload = function () {
        const file_contents = reader.result;

        const save_game = parse_xml(file_contents)
        get_files(["items.xslt", "items-to-csv.xslt"]).then(
            function (requests) {
                const items = process_xslt(parse_xml(requests[0]), save_game);
                const csv = process_xslt(parse_xml(requests[1]), items)

                const csv_array = csv_to_array(xslt_output_to_text(csv));
                const html = make_html_table(csv_array);
                set_output(html);
                enable_table_sort();
            })
    };
    reader.readAsText(input.files[0]);
};


function parse_xml(text) {
    /* Parse a string into xml */
    const xml_parser = new DOMParser();
    return xml_parser.parseFromString(text, "text/xml")
}


function get_files(paths) {
    /* Download an array of URLs */
    let requests = []
    for (let i = 0; i < paths.length; i++) {
        requests.push(fetch(paths[i]).then(x => x.text()))
    }

    return Promise.all(requests)
}

function process_xslt(xslt, text) {
    /* Transform the xml */
    const xslt_processor = new XSLTProcessor();

    xslt_processor.importStylesheet(xslt);
    const processed = xslt_processor.transformToFragment(text, new Document()); // Non-standard, but supported by everything that isn't IE

    return processed;
}


let csv_string;
function xslt_output_to_text(xslt_out) {
    /* Convert the xslt transformed output into a string */
    csv_string = xslt_out.firstChild.wholeText;  // Easiest way to get the xslt-transformed text
    return csv_string
}


function csv_to_array(csv) {
    /* Parse the csv file into an array */
    return csv.split('\n').map(x => x.split(',')) // We made the csv file, so there won't be any edge cases
}


function make_html_table(array) {
    /* Converts the array into the html table */
    let html = template.table.begin;

    html += template.header.begin
    for (let j = 0; j < array[0].length; j++) {
        html += template.table.header_cell(array[0][j]);
    }
    html += template.header.end

    html += template.body.begin;
    for (let i = 1; i < array.length - 1; i++) {
        html += template.row.begin;

        for (let j = 0; j < array[i].length; j++) {
            if (j === 1) { // Quality column
                html += template.table.cell(replace_icon(array[i][j]));
                continue;
            }
            html += template.table.cell(format_integer(array[i][j]));
        }

        html += template.row.end;
    }
    html += template.body.end + template.footer.begin + template.footer.end + template.table.end;

    return html;
}


function replace_icon(quality_name) {
    /* Use the Stardew Valley icons for qualities */
    return quality_name
        .replace(/Silver/, template.icons.silver)
        .replace(/Gold/, template.icons.gold)
        .replace(/Iridium/, template.icons.iridium);
}


function format_integer(number) {
    /* Separate the thousands by a thin space */
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}


function set_output(html) {
    /* Put the table's html into the document */
    let output = template.heading;
    output += template.download('csv_string');
    output += html;

    const old_output = document.querySelector('article');
    if (old_output) { old_output.remove() }

    document.querySelector('output').insertAdjacentHTML('afterbegin', output);

    calculate_sum(); // Calculate the sums *after* the table has been build
    document.getElementById('filter').focus();
}


function parse_integer(number) {
    /* Strip the thin space added by format_integer() */
    const match = number.match(/\d/g);
    return match ? Number(match.join('')) : 0
}


function calculate_sum() {
    /* Show the sums in the footer */
    const table = document.getElementById('item_table').tBodies[0];
    let tot_price = 0;
    let tot_count = 0;
    const current_hidden_filter_class = `filter_${filter_class}`;

    for (let i = 1, row; row = table.rows[i]; i++) {
        if (row.classList.contains(current_hidden_filter_class)) { continue; } // Skip if hidden by filter
        tot_count += parse_integer(row.cells[3].textContent);
        tot_price += parse_integer(row.cells[5].textContent);
    }

    let html = "";
    html += template.row.begin;
    html += template.table.cell("Total") + template.table.cell("") + template.table.cell("");
    html += template.table.cell(format_integer(tot_count));
    html += template.table.cell("");
    html += template.table.cell(format_integer(tot_price)) + template.row.end;

    const old_output = document.querySelector('tfoot tr');
    if (old_output) { old_output.remove() }

    document.querySelector('tfoot').insertAdjacentHTML('afterbegin', html);
}


function enable_table_sort() {
    /* Allow the table to be sorted by clicking on the headings */
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


function download_as_csv(text) {
    /* Allow the user to download their save as a CSV */
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', 'Stardew Valley Items.csv')
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


let filter_class = 1;
function filter_table() {
    /* Allows the table to be filtered
     *
     * The naïve version of this function directly applied
     * 'display: none' to each row. However, this triggered 
     * a repaint for each row, since it was removed from display. 
     * The optimized version of this function applies a new
     * and unique class to each row whenever a filter is 
     * applied. Then—and only then—can we hide that class. 
     * This means that only one repaint is triggered instead
     * of one for each row. In benchmarks, this is about 250%
     * faster than the old function.
     */
    const filter = document.getElementById('filter').value;
    const rows = document.getElementById('item_table').tBodies[0].rows;
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

    calculate_sum() // Update the footer after the filter is applied
    filter_class++; // Increment the class's name
}
