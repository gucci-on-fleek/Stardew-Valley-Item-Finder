'use strict';
var csv_str;

function file_opened(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function () {
        var file_contents = reader.result;
        var xml_parser = new DOMParser();
        var save_game = xml_parser.parseFromString(file_contents, "text/xml")
        var items = process_xslt(save_game, "items.xslt");
        var csv = process_xslt(items, "items-to-csv.xslt")
        csv_str = csv.firstChild.wholeText;
        var csv_parsed = Papa.parse(csv_str).data;
        set_output(make_html_table(csv_parsed));
        new Tablesort(document.getElementById('prices'));

        Tablesort.extend('quality', function (item) {
            return /Gold|Silver|Iridium/.test(item);
        }, function (a, b) {
            if (a === 'Iridium') { return 1 };
            if (b === 'Iridium') { return -1 };
            if (a === 'Gold') { return 1 };
            if (b === 'Gold') { return -1 };
            if (a === 'Silver') { return 1 };
            if (b === 'Silver') { return -1 };
            if (a === '') { return -1 };
            if (b === '') { return 1 };
        });
    };
    reader.readAsText(input.files[0]);
};

function set_output(text) {
    var node = document.getElementById('output');
    node.innerHTML = ""
    node.innerHTML += '<h2>Items <input type="text" id="filter" onkeyup="filter_table()" placeholder="Filter" title="Filter"></input></h2>'
    node.innerHTML += '<input type="button" id="down-button" value="Download as CSV" onclick="download(csv_str)" />'
    node.innerHTML += text;
    calculate_sum()
}

function process_xslt(text, path) {
    var xslt_processor = new XSLTProcessor();

    var http_request = new XMLHttpRequest();
    http_request.open("GET", path, false);
    http_request.send(null);

    var xslt = http_request.responseXML;

    xslt_processor.importStylesheet(xslt);

    var processed = xslt_processor.transformToFragment(text, new Document());
    return processed;
}


function make_html_table(arr) {
    var result = "<table id='prices'>";
    result += "<thead><tr class='header'>"
    for (var j = 0; j < arr[0].length; j++) {
        result += "<td>" + arr[0][j] + "</td>";
    }
    result += "</tr></thead><tbody>"
    for (var i = 1; i < arr.length - 1; i++) {
        result += "<tr>";
        for (var j = 0; j < arr[i].length; j++) {
            result += "<td>" + format_numbers(arr[i][j]) + "</td>";
        }
        result += "</tr>";

    }
    result += "</tbody><tfoot></tfoot></table>";

    return result;
}

function download(text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'Stardew Valley.csv');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function filter_table() {
    const filter = document.querySelector('#filter').value.toLowerCase();
    const rows = document.querySelectorAll('#prices tr:not(.header)');
    rows.forEach(tr => tr.style.display = [...tr.children].find(td => td.innerHTML.toLowerCase().includes(filter)) ? '' : 'none');
    calculate_sum()
}

function calculate_sum() {
    document.querySelector('tfoot').innerHTML = ""
    var table = document.querySelector('#prices');
    var tot_price = 0;
    var tot_count = 0;
    for (var i = 1, row; row = table.rows[i]; i++) {
        if (row.style.display === 'none') { continue; }
        tot_count += parse_numbers(row.cells[3].innerText);
        tot_price += parse_numbers(row.cells[5].innerText);
    }
    var result = "";
    result += "<tr>";
    result += "<td>Total</td><td></td><td></td>";
    result += "<td>" + format_numbers(tot_count) + "</td>";
    result += "<td></td>";
    result += "<td>" + format_numbers(tot_price) + "</td></tr>";
    document.querySelector('tfoot').innerHTML = result;
}

function format_numbers(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function parse_numbers(num) {
    return Number(num.match(/\d/g).join(''))
}
