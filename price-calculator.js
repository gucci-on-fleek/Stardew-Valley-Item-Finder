var csv_str, x, y;

function file_opened(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function () {
        var file_contents = reader.result;
        var xml_parser = new DOMParser();
        var save_game = xml_parser.parseFromString(file_contents, "text/xml")
        y = save_game;
        var items = process_xslt(save_game, "items.xslt");
        var csv = process_xslt(items, "items-to-csv.xslt")
        x = csv;
        csv_str = csv.firstChild.wholeText;
        var csv_parsed = Papa.parse(csv_str).data;
        set_output(make_html_table(csv_parsed));
        new Tablesort(document.getElementById('prices'));

        Tablesort.extend('quality', function (item) {
            return /Gold|Silver|Iridium/.test(item);
        }, function (a, b) {
            // e.g var n = (a > b) ? -1 : 1;
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
    node.innerHTML += '<h2>Items</h2>'
    node.innerHTML += '<input type="button" id="down-button" value="Download as CSV" onclick="download(csv_str)" />'
    node.innerHTML += text;
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
    result += "<thead>"
    for (var j = 0; j < arr[0].length; j++) {
        result += "<td>" + arr[0][j] + "</td>";
    }
    result += "</thead><tbody>"
    for (var i = 1; i < arr.length - 1; i++) {
        result += "<tr>";
        for (var j = 0; j < arr[i].length; j++) {
            result += "<td>" + arr[i][j] + "</td>";
        }
        result += "</tr>";
    }
    result += "</tbody></table>";

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
