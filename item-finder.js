'use strict';
var csv_str; // String holding the csv file

function file_opened(event) {
    /* Handle the user opening a file */
    var input = event.target;
    var reader = new FileReader();

    reader.onload = function () {
        var file_contents = reader.result;
        var xml_parser = new DOMParser();

        var save_game = xml_parser.parseFromString(file_contents, "text/xml")
        var items = fetch_and_process_xslt(save_game, "items.xslt");
        var csv = fetch_and_process_xslt(items, "items-to-csv.xslt")

        csv_str = csv.firstChild.wholeText; // Easiest way to get the xslt-transformed text
        var csv_parsed = parse_csv(csv_str);
        set_output(make_html_table(csv_parsed));
    };
    reader.readAsText(input.files[0]);
};

function set_output(text) {
    /* Put the table's html into the document */
    var node = document.querySelector('#output');

    node.innerHTML = "";
    node.innerHTML += '<h2>Items <input type="text" id="filter" class="input" onkeyup="filter_table()" placeholder="Filter" title="Filter"></input></h2>';
    node.innerHTML += '<input type="button" id="down-button" class="input" value="Download as CSV" onclick="download_as_csv(csv_str)" />';
    node.innerHTML += text;

    calculate_sum(); // Calculate the sums after the table has been build
    document.querySelector('#filter').focus();

    new Tablesort(document.querySelector('#item_table')); // Allow the table headings to be used for sorting
    Tablesort.extend('number', item => item.match(/\d/),
        (a, b) => parse_integer(a) - parse_integer(b))
}

function fetch_and_process_xslt(text, path) {
    /* Download the xslt and transform the xml */
    var http_request = new XMLHttpRequest();
    http_request.open("GET", path, false); // We could use async, but there's nothing to do until the xslt is loaded, so why bother
    http_request.send(null);

    return process_xslt(http_request.responseXML, text);
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
    var result = "<table id='item_table'>";

    result += "<thead><tr class='header'>"
    for (var j = 0; j < arr[0].length; j++) {
        result += "<td>" + arr[0][j] + "</td>";
    }
    result += "</tr></thead><tbody>"

    for (var i = 1; i < arr.length - 1; i++) {
        result += "<tr>";
        for (var j = 0; j < arr[i].length; j++) {
            if (j === 1) { // Quality column
                result += "<td>" + replace_icon(arr[i][j]) + "</td>";
                continue;
            }
            result += "<td>" + format_integer(arr[i][j]) + "</td>";
        }
        result += "</tr>";

    }
    result += "</tbody><tfoot></tfoot></table>";

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
    result += "<tr>";
    result += "<td>Total</td><td></td><td></td>";
    result += "<td>" + format_integer(tot_count) + "</td>";
    result += "<td></td>";
    result += "<td>" + format_integer(tot_price) + "</td></tr>";

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
        .replace(/Silver/, '<img src="assets/silver_star.png" class="icon" /alt="Silver"><div class="sort-id">1</div>')
        .replace(/Gold/, '<img src="assets/gold_star.png" class="icon" /alt="Gold"><div class="sort-id">2</div>')
        .replace(/Iridium/, '<img src="assets/iridium_star.png" class="icon" alt="Iridium"/><div class="sort-id">3</div>');
}

function parse_csv(str) {
    /* Parse the csv file into an array */
    return str.split('\n').map(x => x.split(',')) // We made the csv file, so there won't be any edge cases
}
