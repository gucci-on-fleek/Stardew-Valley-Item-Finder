// @ts-check
/*
 * Original Source:
 * Tablesort v5.2.1 (2020-06-02)
 * http://tristen.ca/tablesort/demo/
 * SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2020 Tristen Brown
 */
/*
 * Modifications:
 * Stardew Valley Item Finder
 * https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
 * SPDX-License-Identifier: MPL-2.0+
 * SPDX-FileCopyrightText: 2021 gucci-on-fleek
 */


function Tablesort(element, options) { /* eslint-disable-line id-match */
    if (!(this instanceof Tablesort)) {
        return new Tablesort(element, options)
    }

    if (!element || element.tagName !== "TABLE") {
        throw new Error("Element must be a table")
    }
    this.init(element, options || {})
}


const sort_options = /** @type {Array<Record<'name'|'pattern'|'sort', any>>} */ ([])


function create_event(name) {
    let event
    if (!window.CustomEvent || typeof window.CustomEvent !== "function") {
        event = document.createEvent("CustomEvent")
        event.initCustomEvent(name, false, false, undefined)
    } else {
        event = new CustomEvent(name)
    }
    return event
}


function get_inner_text(element) {
    return element.getAttribute("data-sort") || element.textContent || element.innerText || ""
}


/** Default sort method if no better sort method is found */
function case_insensitive_sort(a, b) {
    a = a.trim().toLowerCase() // eslint-disable-line no-param-reassign
    b = b.trim().toLowerCase() // eslint-disable-line no-param-reassign
    if (a === b) return 0
    if (a < b) return 1

    return -1
}


function get_cell_by_key(cells, key) {
    return [].slice.call(cells).find(function (cell) {
        return cell.getAttribute("data-sort-column-key") === key
    })
}


/**
 * Stable sort function
 * If two elements are equal under the original sort function,
 * Then there relative order is reversed
 */
function stabilize(sort, anti_stabilize) {
    return function (a, b) {
        const unstable_result = sort(a.td, b.td)
        if (unstable_result === 0) {
            if (anti_stabilize) return b.index - a.index

            return a.index - b.index
        }
        return unstable_result
    }
}


Tablesort.extend = function (name, pattern, sort) {
    if (typeof pattern !== "function" || typeof sort !== "function") {
        throw new Error("Pattern and sort must be a function")
    }
    sort_options.push({
        name,
        pattern,
        sort
    })
}


Tablesort.prototype = {
    init(element, options) {
        const that = /** @type {any} */ (this)
        let first_row, default_sort, i, cell

        that.table = element
        that.thead = false
        that.options = options

        if (element.rows && element.rows.length > 0) {
            if (element.tHead && element.tHead.rows.length > 0) {
                for (i = 0; i < element.tHead.rows.length; i++) {
                    if (element.tHead.rows[i].getAttribute("data-sort-method") === "thead") {
                        first_row = element.tHead.rows[i]
                        break
                    }
                }

                if (!first_row) {
                    first_row = element.tHead.rows[element.tHead.rows.length - 1]
                }
                that.thead = true
            } else {
                first_row = element.rows[0]
            }
        }

        if (!first_row) return

        function on_click() {
            if (that.current && that.current !== this) {
                that.current.removeAttribute("aria-sort")
            }
            that.current = this
            that.sort_table(this)
        }


        for (i = 0; i < first_row.cells.length; i++) { // Assume first row is the header and attach a click handler to each.
            cell = first_row.cells[i]
            cell.setAttribute("role", "columnheader")

            if (cell.getAttribute("data-sort-method") !== "none") {
                cell.tabindex = 0
                cell.addEventListener("click", on_click, false)

                if (cell.getAttribute("data-sort-default") !== null) {
                    default_sort = cell
                }
            }
        }

        if (default_sort) {
            that.current = default_sort
            that.sort_table(default_sort)
        }
    },

    sort_table(header, update) {
        const that = /** @type {any} */ (this)
        const column_key = header.getAttribute("data-sort-column-key")
        const column = header.cellIndex
        let sort_function = case_insensitive_sort
        let item = /** @type {any} */ ("")
        const items = []
        let i = that.thead ? 0 : 1
        const sort_method = header.getAttribute("data-sort-method")
        let sort_order = header.getAttribute("aria-sort")

        that.table.dispatchEvent(create_event("beforeSort"))

        if (!update) { // If updating an existing sort, direction should remain unchanged.
            if (sort_order === "ascending") {
                sort_order = "descending"
            } else if (sort_order === "descending") {
                sort_order = "ascending"
            } else {
                sort_order = that.options.descending ? "descending" : "ascending"
            }
            header.setAttribute("aria-sort", sort_order)
        }
        if (that.table.rows.length < 2) return

        if (!sort_method) { // If we force a sort method, it is not necessary to check rows
            let cell
            while (items.length < 3 && i < that.table.tBodies[0].rows.length) {
                if (column_key) {
                    cell = get_cell_by_key(that.table.tBodies[0].rows[i].cells, column_key)
                } else {
                    cell = that.table.tBodies[0].rows[i].cells[column]
                }

                item = cell ? get_inner_text(cell) : "" // Treat missing cells as empty cells
                item = item.trim()

                if (item.length > 0) {
                    items.push(item)
                }

                i++
            }
            if (!items) return
        }

        for (i = 0; i < sort_options.length; i++) {
            item = sort_options[i]

            if (sort_method) {
                if (item.name === sort_method) {
                    sort_function = item.sort
                    break
                }
            } else if (items.every(item.pattern)) {
                sort_function = item.sort
                break
            }
        }

        that.col = column

        for (i = 0; i < that.table.tBodies.length; i++) {
            const new_rows = []
            const no_sorts = {}
            let j
            let total_rows = 0
            let no_sorts_so_far = 0

            if (that.table.tBodies[i].rows.length < 2) continue

            for (j = 0; j < that.table.tBodies[i].rows.length; j++) {
                let cell
                item = that.table.tBodies[i].rows[j]

                if (item.getAttribute("data-sort-method") === "none") {
                    /*
                     * Keep no-sorts in separate list to be able to insert
                     * Them back at their original position later
                     */
                    no_sorts[total_rows] = item
                } else {
                    if (column_key) {
                        cell = get_cell_by_key(item.cells, column_key)
                    } else {
                        cell = item.cells[that.col]
                    }

                    new_rows.push({ // Save the index for stable sorting
                        tr: item,
                        td: cell ? get_inner_text(cell) : "",
                        index: total_rows
                    })
                }
                total_rows++
            }

            /*
             * Before we append should we reverse the new array or not?
             * If we reverse, the sort needs to be `anti-stable` so that
             * The double negatives cancelement out
             */
            if (sort_order === "descending") {
                new_rows.sort(stabilize(sort_function, true))
            } else {
                new_rows.sort(stabilize(sort_function, false))
                new_rows.reverse()
            }

            for (j = 0; j < total_rows; j++) { // Append rows that already exist rather than creating new ones
                if (no_sorts[j]) {
                    item = no_sorts[j] // We have a no-sort row for this position, insert it here.
                    no_sorts_so_far++
                } else {
                    item = new_rows[j - no_sorts_so_far].tr
                }

                that.table.tBodies[i].appendChild(item) // AppendChild(x) moves x if already present somewhere else in the DOM
            }
        }
        that.table.dispatchEvent(create_event("afterSort"))
    },

    refresh() {
        const that = /** @type {any} */ (this)
        if (that.current !== undefined) {
            that.sort_table(that.current, true)
        }
    }
}


export {Tablesort}
