'use strict';
let csv_string; // String holding the csv file

const template = {
    /* Object containing all output HTML strings */
    heading: `<article><h2>Items
    <input type="text" id="filter" class="input" onkeyup="filter_table()" placeholder="Filter" title="Filter" aria-label="Filter Table" ></input>
    </h2>`,
    download: (x) => `<input type="button" id="down-button" class="input" value="Download as CSV" onclick="download_as_csv(${x})" />`,
    table: {
        begin: `<table id='item_table'>`,
        end: `</table></article>`,
        cell: (x) => `<td>${x}</td>`,
        header_cell: (x) => `<th tabindex="0">${x}</th>`,
    },
    header: {
        begin: `<thead><tr class='header'>`,
        end: `</tr></thead>`,
    },
    body: {
        begin: `<tbody>`,
        end: `</tbody>`
    },
    row: {
        begin: `<tr>`,
        end: `</tr>`
    },
    footer: {
        begin: `<tfoot>`,
        end: `</tfoot>`
    },
    icons: {
        silver: `<img src="assets/silver_star.png" class="icon" alt="Silver" title="Silver" /><div class="sort-id">1</div>`,
        gold: `<img src="assets/gold_star.png" class="icon" alt="Gold" alt="Gold" title="Gold" /><div class="sort-id">2</div>`,
        iridium: `<img src="assets/iridium_star.png" class="icon" alt="Iridium" title="Iridium" /><div class="sort-id">3</div>`,
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

                const csv_parsed = parse_csv(xslt_output_to_text(csv));
                const html = make_html_table(csv_parsed);
                set_output(html);
                enable_table_sort();
            })
    };
    reader.readAsText(input.files[0]);
};

function xslt_output_to_text(xslt_out) {
    /* Convert the xslt transformed output into a string */
    csv_string = xslt_out.firstChild.wholeText;  // Easiest way to get the xslt-transformed text
    return csv_string
}

function parse_xml(text) {
    /* Parse a string into xml */
    const xml_parser = new DOMParser();
    return xml_parser.parseFromString(text, "text/xml")
}

function set_output(html) {
    /* Put the table's html into the document */
    const node = document.querySelector('output');

    node.innerHTML = "";
    node.innerHTML += template.heading;
    node.innerHTML += template.download('csv_string');
    node.innerHTML += html;

    calculate_sum(); // Calculate the sums after the table has been build
    document.querySelector('#filter').focus();
}

function enable_table_sort() {
    /* Allow the table to be sorted by clicking on the headings */
    const item_table = document.querySelector('#item_table');
    const tablesort = new Tablesort(item_table); // Allow the table headings to be used for sorting

    Tablesort.extend('number', item => item.match(/\d/), // Sort numerically
        (a, b) => parse_integer(a) - parse_integer(b));

    const cells = item_table.tHead.rows[0].cells;
    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                tablesort.sortTable(e.srcElement)
            }
        })
    }
}

function get_files(paths) {
    /* Download an array of files */
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


function make_html_table(arr) {
    /* Converts the array into the html table */
    let result = template.table.begin;

    result += template.header.begin
    for (let j = 0; j < arr[0].length; j++) {
        result += template.table.header_cell(arr[0][j]);
    }
    result += template.header.end + template.body.begin;

    for (let i = 1; i < arr.length - 1; i++) {
        result += template.row.begin;
        for (let j = 0; j < arr[i].length; j++) {
            if (j === 1) { // Quality column
                result += template.table.cell(replace_icon(arr[i][j]));
                continue;
            }
            result += template.table.cell(format_integer(arr[i][j]));
        }
        result += template.row.end;

    }
    result += "</tbody><tfoot></tfoot></table>"; template.body.end + template.footer.begin + template.footer.end + template.table.end

    return result;
}

function download_as_csv(text) {
    /* Allow the user to download their save as a CSV */
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'Stardew Valley Items.csv');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function filter_table() {
    /* Allows the table to be filtered */
    const filter = document.querySelector('#filter').value.toLowerCase();
    const rows = document.querySelectorAll('#item_table tr:not(.header)');
    rows.forEach(tr => tr.style.display = [...tr.children].find(td => td.innerHTML.toLowerCase().match(RegExp(filter))) ? '' : 'none');
    calculate_sum() // Update the footer after the filter is applied
}

function calculate_sum() {
    /* Show the sums in the footer */
    document.querySelector('tfoot').innerHTML = ""
    const table = document.querySelector('#item_table');
    let tot_price = 0;
    let tot_count = 0;

    for (let i = 1, row; row = table.rows[i]; i++) {
        if (row.style.display === 'none') { continue; } // Skip if hidden by filter
        tot_count += parse_integer(row.cells[3].innerText);
        tot_price += parse_integer(row.cells[5].innerText);
    }

    let result = "";
    result += template.row.begin;
    result += template.table.cell("Total") + template.table.cell("") + template.table.cell("");
    result += template.table.cell(format_integer(tot_count));
    result += template.table.cell("");
    result += template.table.cell(format_integer(tot_price)) + template.row.end;

    document.querySelector('tfoot').innerHTML = result;
}

function format_integer(num) {
    /* Separate the thousands by a thin space */
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function parse_integer(num) {
    /* Strip the thin space added by format_integer() */
    const match = num.match(/\d/g);
    return match ? Number(match.join('')) : 0
}

function replace_icon(str) {
    /* Use the Stardew Valley icons for qualities */
    return str
        .replace(/Silver/, template.icons.silver)
        .replace(/Gold/, template.icons.gold)
        .replace(/Iridium/, template.icons.iridium);
}

function parse_csv(str) {
    /* Parse the csv file into an array */
    return str.split('\n').map(x => x.split(',')) // We made the csv file, so there won't be any edge cases
}
