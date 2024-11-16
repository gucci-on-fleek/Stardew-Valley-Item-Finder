// @ts-check
/*
 * Stardew Valley Item Finder
 * https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
 * SPDX-License-Identifier: MPL-2.0+
 * SPDX-FileCopyrightText: 2022 Max Chernoff
 */

/**
 * @type {Object<String, Function>}
 */
let template, elements

/**
 * Populates the template object with its members
 * @effects Modifies global `template`
 */
function create_templates() {
    /*
     * We're handling the elements a little differently here: instead
     * of calling `document.getElementById` to get an element, you need
     * to index the global object `elements`. This seems equivalent, but
     * it provides a few advantages:
     *  1) Elements are cached after they have been retrieved. This may
     *     provide a very small speedup
     *  2) The major reason is so that we can properly typecast elements
     *     globally. This way, we can typecast all of the elements in one
     *     place, and avoid messy typecasts inline.
     */
    const __elements = { /* Holds the elements that require a typecast */
        item_table: /** @type {HTMLTableElement} */ (document.getElementById("item_table"))
    }

    const elements_handler = {
        get(target, property) {
            if (target[property] === undefined || target[property] === null) {
                target[property] = document.getElementById(property)
            }
            return target[property]
        },

        deleteProperty(target, property) {
            target[property].remove()
            delete target[property]

            return true
        }
    }

    elements = new Proxy(__elements, elements_handler)

    /*
     * The `template` global is much like the `elements` global, however
     * the motivation is slightly different. The point of the `template`
     * being constructed this way is so that most of the templates can
     * be handled in a general way, but exceptions are easy to add.
     */
    const __template = {
        _header_cell(x) { /* Creates each header cell */
            const clone = clone_template(elements.header_cell_base).firstElementChild
            clone.insertAdjacentHTML("beforeend", x)

            return /** @type {HTMLTableHeaderCellElement} */ (clone)
        },
        column_header_cell(x) {
            const cell = this._header_cell(x)
            cell.setAttribute("scope", "col")

            return cell
        },
        row_header_cell(x) {
            const cell = this._header_cell(x)
            cell.setAttribute("scope", "row")

            return cell
        },
        header(x) { /* Creates the header row */
            const clone = clone_template(elements.header_base).firstElementChild
            clone.appendChild(x)

            return clone
        },
        wiki_link(x) {
            const clone = /** @type {HTMLAnchorElement} */ (clone_template(elements.wiki_link_base).firstElementChild)
            clone.href += encodeURIComponent(x)

            return clone
        },
        wiki_search(x) {
            const clone = /** @type {HTMLAnchorElement} */ (clone_template(elements.wiki_search_base).firstElementChild)
            clone.href += encodeURIComponent(x)

            return clone
        },
    }

    const template_handler = {
        get(target, property) {
            if (target[property] === undefined) {
                target[property] = () => clone_template(elements[`${property}_base`]).firstElementChild
            }
            return target[property]
        }
    }

    template = new Proxy(__template, template_handler)
}


/**
 * Initialize necessary features after the site has fully loaded
 * @effects Modifies global variables, adds event listeners
 */
function initialize_page() {
    create_templates()

    const listeners = [
        [elements.save_file_input, "change", event => file_opened(event)],
        [elements.filter, "keyup", () => filter_table()],
        [elements.down_button, "click", () => download_as_tsv(_tsv_string)],
        [document.body, "dragover", event => event.preventDefault()], /* Needed for the drop event to run */
        [document.body, "drop", event => file_opened(event)],
        ...[...qsa("summary")].map(x => [x, "mousedown", event => { /* Allow a middle-click to open all summary/details elements */
            event.preventDefault()
            event.target.click()
        }]),
    ]
    for (const [element, type, callback] of listeners) {
        element.addEventListener(type, callback)
    }
}


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize_page) /* Initialize as soon as the page is loaded */
} else { /* DOMContentLoaded has already fired, so run it now */
    initialize_page()
}


window.addEventListener("load", function () {
    get_previous_save()

    if (!window.location.origin.includes("127.0.0.1")) { /* Disable the cache for local development */
        navigator.serviceWorker.register("assets/service-worker.js")
    }
})


/**
 * Handle the user opening a file
 * @param {Event} event - The event
 * @remarks Triggered by the file input
 * @effects Modifies the `#table_container` DOM element
 */
function file_opened(event) {
    event.preventDefault()
    loading_screen({show_loading: true, show_input: false})

    let file
    if (event instanceof window.DragEvent) {
        event.dataTransfer.dropEffect = "copy"
        file = event.dataTransfer.files[0]
    } else if (event.target instanceof window.HTMLInputElement) {
        const input = event.target
        file = input.files[0]
    } else { /* This shouldn't happen */
        show_element(elements.error)

        return
    }

    const reader = new FileReader()
    reader.onload = function () {
        const file_contents = /** @type {String} */ (reader.result)
        const save_game = parse_xml(file_contents)

        get_files(["assets/items.xslt", "assets/items-to-tsv.xslt"]).then(
            function (requests) {
                const items = process_xslt(parse_xml(requests[0]), save_game)
                const tsv = process_xslt(parse_xml(requests[1]), items)

                array_to_table(tsv_to_array(xslt_output_to_text(tsv)))
                show_initial_sort_direction()
            })
            .finally(() => loading_screen({show_loading: false, show_input: true}))
            .catch(() => show_element(elements.error))
    }
    reader.readAsText(file)
}


/**
 * Loads a previous save file from LocalStorage and treats as if
 * it were manually loaded.
 * @effects None directly, however called functions modify the DOM.
 * @remarks Attempts to load previous save, does nothing if unsuccessful.
 */
function get_previous_save() {
    const tsv = localStorage.getItem("tsv")
    if (tsv) {
        loading_screen({show_loading: true, show_input: true})
        _tsv_string = tsv
        array_to_table(tsv_to_array(tsv))
        show_initial_sort_direction()
        loading_screen({show_loading: false, show_input: true})
    }
}


/**
 * A shorthand for `document.querySelector()`
 * @param {String} selector - A selector for an element to retrieve
 * @returns {HTMLElement} The element requested
 * @effects None
 */
function qs(selector) {
    return document.querySelector(selector)
}


/**
 * A shorthand for `document.querySelectorAll()`
 * @param {String} selector - A selector for the elements to retrieve
 * @returns {NodeListOf<Element>} The elements requested
 * @effects None
 */
function qsa(selector) {
    return document.querySelectorAll(selector)
}


/**
 * Clone a template
 * @param {HTMLTemplateElement} element - The element to clone
 * @returns {HTMLElement} A duplicate of the initial element
 * @effects None
 */
function clone_template(element) {
    return /** @type {HTMLElement} */ (element.content.cloneNode(true))
}


/**
 * Makes an `HTML` table from `TSV` and inserts it into the DOM.
 * @param {String[][]} array - The `TSV` to make a table from
 * @effects None directly, however called functions modify the DOM.
 */
function array_to_table(array) {
    let table = template.table()
    table = make_html_table(array, table)
    table = make_header(array, table)
    set_output(table)
    enable_table_sort()
    enable_wiki_click()
}


/**
 * Hides a DOM element
 * @param {HTMLElement} element - The element to hide
 * @effects Modifies the DOM to hide the element
 */
function hide_element(element) {
    element.hidden = true
}


/**
 * Shows a DOM element that has been previously hidden
 * @param {HTMLElement} element - The element to show
 * @effects Modifies the DOM to show the element
 */
function show_element(element) {
    element.hidden = false
}


/**
 * Displays a loading indicator
 * @param {{show_loading?: Boolean; show_input?: Boolean}} arguments - Should we show/hide the input box or the loading screen
 * @effects Modifies the DOM to show/hide the loading display
 */
function loading_screen({show_loading = true, show_input = true} = {}) {
    const loading = elements.loading
    const input = qs("label[for=save_file_input]")

    if (show_loading) {
        show_element(loading)
        if (!show_input) hide_element(input)
    } else {
        show_element(input)
        hide_element(loading)
    }
}


/**
 * Parse a string as `XML`
 * @param {String} text - The string to parse as `XML`
 * @returns {XMLDocument} A `DOM` object representing the input `XML`
 * @effects None
 */
function parse_xml(text) {
    const xml_parser = new DOMParser()

    return xml_parser.parseFromString(text, "text/xml")
}


/**
 * Download an array of URLs
 * @param {String[]} paths - An array of URLs to fetch
 * @returns {Promise} A promise holding the text for each request
 * @effects Initiates a network request to download the URLs
 */
function get_files(paths) {
    const requests = []
    for (const path of paths) {
        requests.push(fetch(path).then(x => x.text()))
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
    const xslt_processor = new XSLTProcessor()

    xslt_processor.importStylesheet(xslt)
    const processed = xslt_processor.transformToFragment(xml, new Document()) /* Non-standard, but supported by everything that isn't IE */

    return processed
}


let _tsv_string /* Global, holds the TSV so that it can later be downloaded */
/**
 * Convert the `XSLT` transformed output into a string. Also, save
 *          the output in LocalStorage.
 * @param {DocumentFragment} xml - The `XML` to convert to a string
 * @returns {String} A string representing the `XML`'s contents
 * @remarks `XSLT` transform a document into another `XML` document
 *          or plain text, however, the `XSLTProcessor` object always
 *          returns an `XMLDocument` object. Since we are transforming
 *          the `TSV` into plain text, we need to call this function
 *          to get a string.
 * @effects Modifies global variable `tsv_string`. Also adds `tsv` key
 *          to LocalStorage.
 */
function xslt_output_to_text(xml) {
    const text_node = /** @type {Text} */ (xml.firstChild)
    _tsv_string = text_node.wholeText
    localStorage.setItem("tsv", _tsv_string)

    return _tsv_string
}


/**
 * Parse the `TSV` file into an array
 * @param {String} tsv - The `TSV` file
 * @returns {String[][]} - An array representing the `TSV`
 * @remarks This is a very basic `TSV` parser. It just splits on
 *          tabs and newlines, so any edge cases **will not** be
 *          accounted for. However, there won't be any edge cases
 *          since we control the input `TSV`.
 * @effects None
 */
function tsv_to_array(tsv) {
    return tsv
        .split("\n")
        .map(x => x.split("\t"))
        .slice(0, -1) /* We made the tsv file, so there won't be any edge cases */
}


/**
 * Adds text to an `HTML` element
 * @param {HTMLTableCellElement } cell - The cell to add the text
 * @param {String} text - The text to add
 * @effects Modifies input param `cell`
 */
function cell_text(cell, text) {
    cell.appendChild(document.createTextNode(text))
}


/**
 * Converts the array into the `HTML` table
 * @param {String[][]} array - The array to make into a table
 * @param {HTMLTableElement} table - The document fragment to make the table in
 * @returns {HTMLTableElement} The input array as an `HTML` table
 * @effects None
 */
function make_html_table(array, table) {
    for (const tsv_row of array.slice(1)) {
        const table_row = table.insertRow()

        for (const [index, tsv_cell] of tsv_row.entries()) {
            switch (index) {
                case 0: { /* Item Name */
                    table_row.appendChild(template.row_header_cell(tsv_cell))
                    break
                }
                case 1: { /* Quality column */
                    const table_cell = table_row.insertCell()
                    const icons = replace_icon(tsv_cell)
                    table_cell.appendChild(icons)
                    break
                }
                default: {
                    const table_cell = table_row.insertCell()
                    cell_text(table_cell, format_integer(tsv_cell))
                }
            }
        }
    }
    return table
}


/**
 * Extracts the header from the array and returns an `HTML` table header
 * @param {String[][]} array - The array to make into a header
 * @param {HTMLTableElement} table - The document fragment to make the table in
 * @returns {HTMLTableElement} The input array as an `HTML` table header
 * @effects None
 */
function make_header(array, table) {
    const html = new DocumentFragment()
    const row = array[0]
    for (const cell of row) {
        html.append(template.column_header_cell(cell))
    }
    table.tHead.appendChild(template.header(html))

    return table
}


/**
 * Replace quality names with their corresponding icon
 * @param {"Silver"|"Gold"|"Iridium"|""|String} quality_name - The quality name (Silver, Gold, or Iridium)
 * @returns {Node} An array containing an `HTML` fragment containing a star icon and the order in which to sort the quality.
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
        case "":
            return document.createTextNode("")
        default:
            return document.createTextNode("") /* This shouldn't happen, so return an empty node */
    }
}


/**
 * Format an integer so that it is human-readable
 * @param {String|Number} number - The integer to format
 * @remarks Separate the thousands by a thin space
 * @effects None
 */
function format_integer(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}


/**
 * Put the table's `HTML` into the document
 * @param {HTMLTableElement} table - The `HTML` fragment to add to the document
 * @effects Modifies DOM element `#table_container`.
 */
const set_output = (function () {
    let previous_output = false /* True on 2nd/3rd/xth save file loads */

    return function (table) {
        hide_element(qs("article"))

        if (previous_output) { /* Remove old table */
            delete elements.item_table
        }
        table = calculate_sum(table) /* eslint-disable-line no-param-reassign */

        const container = elements.table_container
        container.appendChild(table)

        show_element(qs("article"))
        previous_output = true
    }
})()


/**
 * Strip the thin space added by `format_integer()`
 * @param {String} number - A string containing a number
 * @returns {Number} The integer found, or 0 otherwise
 * @remarks Just concatenates all numerals found in a string
 * @effects None
 */
function parse_integer(number) {
    const match = number.match(/\d/g)

    return match ? Number(match.join("")) : 0
}


/**
 * Show the table sums in its footer
 * @param {HTMLTableElement} table - The document fragment to sum
 * @effects None
 */
function calculate_sum(table) {
    const foot = table.tFoot
    let tot_price = 0
    let tot_count = 0
    const current_hidden_filter_class = `filter_${_filter_class}`

    while (foot.rows[0]) { /* Remove old footers */
        foot.rows[0].remove()
    }

    for (const row of table.tBodies[0].rows) {
        if (row.classList.contains(current_hidden_filter_class)) {
            continue
        } /* Skip if hidden by filter */
        tot_count += parse_integer(row.cells[3].textContent)
        tot_price += parse_integer(row.cells[5].textContent)
    }

    const row = foot.insertRow()
    const blank = () => cell_text(row.insertCell(), "")

    cell_text(row.insertCell(), "Total")
    blank()
    blank()
    cell_text(row.insertCell(), format_integer(tot_count))
    blank()
    cell_text(row.insertCell(), format_integer(tot_price))

    return table
}

/**
 * Adds an `onclick` event listener to an element
 * @param {*} element - The element which receives the click
 * @param {Function} callback - Callback function. Takes the event as its only parameter
 * @remarks This function is better than just `element
 *          .addEventListener("click", callback)` because it takes
 *          keyboard use into consideration. This is very important for
 *          accessibility, since the keyboard should be able to do
 *          everything that the mouse can.
 * @effects Adds event listeners and modifies DOM
 */
function add_click_event(element, callback) {
    element.addEventListener("click", callback)

    element.setAttribute("tabindex", "0")
    element.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            callback(event)
        }
    })
}


/**
 * Allow the table to be sorted by clicking on the headings
 * @effects Initializes table sorting. Adds event listeners to the table headers.
 */
function enable_table_sort() {
    const get_header_cells = () => elements.item_table.tHead.rows[0].cells /* This needs to be a function since the actual table element is replaced multiple times */

    for (const cell of get_header_cells()) {
        add_click_event(cell, function ({target}) {
            const index = target.cellIndex
            const next_sort_ascending = target.getAttribute("aria-sort") !== "ascending"

            sort_table(index, next_sort_ascending)

            get_header_cells()[index].focus()
            get_header_cells()[index].setAttribute("aria-sort", next_sort_ascending ? "ascending" : "descending")
            filter_table()
        })
    }
}


const sort_table = (function () {
    const qualities = ["Iridium", "Gold", "Silver", ""]
    const sorts = [
        {
            test(a) { return /\d/.test(a) }, /* Numbers */
            compare(a, b) { return parse_integer(a) - parse_integer(b) }
        },
        {
            test(a) { return qualities.indexOf(a) !== -1 }, /* Qualities */
            compare(a, b) { return qualities.indexOf(b) - qualities.indexOf(a) }
        },
        {
            test() { return true }, /* Fallback String */
            compare(a, b) { return a.localeCompare(b) }
        }
    ]

    /**
     * Sorts the item table
     * @param {Number} column_index - The column to sort by
     * @param {Boolean} ascending - `true` if the sort should be smallest-to-largest; `false` if the sort should be largest-to-smallest
     * @effects Modifies the item table in the DOM
     */
    return function (column_index, ascending = true) {
        const tsv_array = tsv_to_array(_tsv_string)
        const sorting_array = tsv_array.slice(1) /* Remove the header */
        let compare

        for (const sort of sorts) {
            if (sort.test(sorting_array[0][column_index])) {
                if (ascending) {
                    compare = (a, b) => sort.compare(a[column_index], b[column_index])
                } else {
                    compare = (a, b) => sort.compare(b[column_index], a[column_index])
                }
                break
            }
        }

        sorting_array.sort(compare)

        sorting_array.splice(0, 0, tsv_array[0]) /* Add back the header */
        array_to_table(sorting_array)
    }
})()


/**
 * Show that the table is initially sorted by descending "Stack Price"
 * @effects Modifies table header cell ARIA attributes
 */
function show_initial_sort_direction() {
    const header_cells = elements.item_table.tHead.rows[0].cells

    header_cells[header_cells.length - 1].setAttribute("aria-sort", "descending")
}


/**
 * Allow the user to download their save as a TSV
 * @param {String} text
 * @remarks Called by the download button
 * @effects Temporarily modifies DOM. Triggers a download.
 */
function download_as_tsv(text) {
    const element = document.createElement("a")
    element.setAttribute("href", `data:text/tab-separated-values;charset=utf-8,${encodeURIComponent(text)}`)
    element.setAttribute("download", "Stardew Valley Items.tsv")
    hide_element(element)

    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}


let _filter_class = 1 /* Monotonically incrementing counter to ensure unique CSS classes */
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
    const filter = elements.filter.value
    const table = elements.item_table
    const rows = table.tBodies[0].rows
    const search = RegExp(filter, "i")
    const last_filter_class = _filter_class - 1 /* The class that we're adding */
    const last_last_filter_class = last_filter_class - 1 /* The class that we're removing */
    const filter_class_name = `filter_${_filter_class}`
    const last_last_filter_class_name = `filter_${last_last_filter_class}`

    remove_wiki_descriptions()
    for (const row of rows) {
        if (!row.textContent.match(search)) {
            row.classList.add(filter_class_name)
        }
        row.classList.remove(last_last_filter_class_name) /* Cleanup old filter classes */
    }

    const style = document.styleSheets[0]
    style.insertRule(`.${filter_class_name} {visibility: collapse}`)
    if (last_last_filter_class >= 0) {
        style.deleteRule(1)
    }

    calculate_sum(table) /* Update the footer after the filter is applied */

    _filter_class++ /* Increment the class's name */
}


/**
 * Allows the user to click on an item name and view its description from the *Stardew Valley Wiki*
 * @effects Adds event listeners. Modifies the DOM. Calls functions which make network requests.
 */
function enable_wiki_click() {
    function wiki_click_event(event) {
        const target = event.target
        if (target.cellIndex !== 0) { /* Only capture click events on the first row */
            return
        }
        const page_title = normalize_names(target.textContent)

        let cell /* Allow the cell to be carried through each finally/then/catch stages */
        wiki_description_by_title(page_title).finally(function () {
            remove_wiki_descriptions()
            const row = body.insertRow(target.parentElement.rowIndex)
            row.className = "item_description"
            cell = row.insertCell()
            cell.colSpan = 6
        })
            .then(function (result) {
                cell.innerHTML = result /* Use innerHTML because the result can contain character entities */
                cell_text(cell, " ")
                cell.appendChild(template.wiki_link(page_title))
            })
            .catch(function (result) {
                cell.innerHTML = result.message
                cell_text(cell, " ")
                cell.appendChild(template.wiki_search(page_title))
            })
    }

    const table = elements.item_table
    const body = table.tBodies[0]

    add_click_event(body, wiki_click_event)
}


/**
 * Get the description of an item from the *Stardew Valley Wiki* using its name.
 * @param {String} title - The title of the page to request
 * @returns {Promise<String>} A promise representing the network request.
 * @remarks Uses CORS/fetch to get JSON with the page's first paragraph.
 * @effects Makes an unauthenticated network request to the *Wiki*.
 */
async function wiki_description_by_title(title) {
    const url_parameters = new URLSearchParams({
        action: "query",
        format: "json",
        formatversion: "2",
        redirects: "",
        origin: "*",
        prop: "pageprops",
        titles: title
    })
    const fetch_url = `https://stardewvalleywiki.com/mediawiki/api.php?${ url_parameters.toString()}`

    const request = await fetch(fetch_url)
    const data = await request.json()

    try {
        return data.query.pages[0].pageprops.description
    } catch {
        throw Error("Item not found.")
    }
}


/**
 * Removes old Wiki description rows.
 * @effects Modifies DOM.
 */
function remove_wiki_descriptions() {
    const descriptions = qsa(".item_description")
    for (const description of descriptions) {
        description.remove()
    }
}


const _prefixed_items = ["Honey", "Juice", "Wine", "Jelly", "Aged Roe", "Roe"] /* Constant that lists all items that need to be normalized before a Wiki request. */
/**
 * Normalize item names for the *Stardew Valley Wiki* request.
 * @param {String} name - The name of the item
 * @returns {String} The item name after normalization.
 * @remarks "Large Goat Milk" is listed as "L. ..." in the save file
 *          but there is no redirect for this in the Wiki. The other
 *          items that need to be normalized are all nouns, except for
 *          "pickled", which is corrected to its noun form.
 * @effects None
 */
function normalize_names(name) {
    if (name.includes("L. Goat Milk")) {
        return "Large Goat Milk"
    }
    if (name.includes("Pickled")) {
        return "Pickles"
    }
    for (const item of _prefixed_items) {
        if (name.includes(item)) {
            return item
        }
    }
    return name
}
