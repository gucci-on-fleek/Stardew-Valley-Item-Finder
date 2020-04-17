'use strict';
var csv_string; // String holding the csv file

const template = {
    /* Object containing all output HTML strings */
    heading: `<h2>Items
    <input type="text" id="filter" class="input" onkeyup="filter_table()" placeholder="Filter" title="Filter" aria-label="Filter Table" ></input>
    </h2>`,
    download: (x) => `<input type="button" id="down-button" class="input" value="Download as CSV" onclick="download_as_csv(${x})" />`,
    table: {
        begin: `<table id='item_table'>`,
        end: `</table>`,
        cell: (x) => `<td>${x}</td>`,
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
        silver: `<img src="assets/silver_star.png" class="icon" /alt="Silver"><div class="sort-id">1</div>`,
        gold: `<img src="assets/gold_star.png" class="icon" /alt="Gold"><div class="sort-id">2</div>`,
        iridium: `<img src="assets/iridium_star.png" class="icon" alt="Iridium"/><div class="sort-id">3</div>`,
    }
}


function file_opened(event) {
    /* Handle the user opening a file */
    var input = event.target;
    var reader = new FileReader();

    reader.onload = function () {
        var file_contents = reader.result;

        var save_game = parse_xml(file_contents)
        get_files(["items.xslt", "items-to-csv.xslt"]).then(
            function (requests) {
                var items = process_xslt(parse_xml(requests[0]), save_game);
                var csv = process_xslt(parse_xml(requests[1]), items)

                var csv_parsed = parse_csv(xslt_output_to_text(csv));
                var html = make_html_table(csv_parsed);
                set_output(html);
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
    var xml_parser = new DOMParser();
    return xml_parser.parseFromString(text, "text/xml")
}

function set_output(text) {
    /* Put the table's html into the document */
    var node = document.querySelector('output');

    node.innerHTML = "";
    node.innerHTML += template.heading;
    node.innerHTML += template.download('csv_str');
    node.innerHTML += text;

    calculate_sum(); // Calculate the sums after the table has been build
    document.querySelector('#filter').focus();

    new Tablesort(document.querySelector('#item_table')); // Allow the table headings to be used for sorting
    Tablesort.extend('number', item => item.match(/\d/),
        (a, b) => parse_integer(a) - parse_integer(b))
}

function get_files(paths) {
    /* Download an array of files */
    var requests = []
    for (var i = 0; i < paths.length; i++) {
        requests.push(fetch(paths[i]).then(x => x.text()))
    }

    return Promise.all(requests)
}



function process_xslt(xslt, text) {
    /* Transform the xml */
    var xslt_processor = new XSLTProcessor();

    xslt_processor.importStylesheet(xslt);
    var processed = xslt_processor.transformToFragment(text, new Document()); // Non-standard, but supported by everything that isn't IE

    return processed;
}


function make_html_table(arr) {
    /* Converts the array into the html table */
    var result = template.table.begin;

    result += template.header.begin
    for (var j = 0; j < arr[0].length; j++) {
        result += template.table.cell(arr[0][j]);
    }
    result += template.header.end + template.body.begin;

    for (var i = 1; i < arr.length - 1; i++) {
        result += template.row.begin;
        for (var j = 0; j < arr[i].length; j++) {
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
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'Stardew Valley Items.csv');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function filter_table() {
    /* Allows the table to be filtered */
    var filter = document.querySelector('#filter').value.toLowerCase();
    var rows = document.querySelectorAll('#item_table tr:not(.header)');
    rows.forEach(tr => tr.style.display = [...tr.children].find(td => td.innerHTML.toLowerCase().match(RegExp(filter))) ? '' : 'none');
    calculate_sum() // Update the footer after the filter is applied
}

function calculate_sum() {
    /* Show the sums in the footer */
    document.querySelector('tfoot').innerHTML = ""
    var table = document.querySelector('#item_table');
    var tot_price = 0;
    var tot_count = 0;

    for (var i = 1, row; row = table.rows[i]; i++) {
        if (row.style.display === 'none') { continue; } // Skip if hidden by filter
        tot_count += parse_integer(row.cells[3].innerText);
        tot_price += parse_integer(row.cells[5].innerText);
    }

    var result = "";
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
    var match = num.match(/\d/g);
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
