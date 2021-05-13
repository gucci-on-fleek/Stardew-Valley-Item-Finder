/*
 * Tablesort v5.2.1 (2020-06-02)
 * http://tristen.ca/tablesort/demo/
 * SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2020 Tristen Brown
 */
function Tablesort(el, options) {
    if (!(this instanceof Tablesort)) return new Tablesort(el, options)

    if (!el || el.tagName !== "TABLE") {
        throw new Error("Element must be a table")
    }
    this.init(el, options || {})
}

const sortOptions = []

const createEvent = function (name) {
    let evt

    if (!window.CustomEvent || typeof window.CustomEvent !== "function") {
        evt = document.createEvent("CustomEvent")
        evt.initCustomEvent(name, false, false, undefined)
    } else {
        evt = new CustomEvent(name)
    }
    return evt
}

const getInnerText = function (el) {
    return el.getAttribute("data-sort") || el.textContent || el.innerText || ""
}

// Default sort method if no better sort method is found
const caseInsensitiveSort = function (a, b) {
    a = a.trim().toLowerCase()
    b = b.trim().toLowerCase()

    if (a === b) return 0
    if (a < b) return 1

    return -1
}

const getCellByKey = function (cells, key) {
    return [].slice.call(cells).find(function (cell) {
        return cell.getAttribute("data-sort-column-key") === key
    })
}

/*
 * Stable sort function
 * If two elements are equal under the original sort function,
 * Then there relative order is reversed
 */
const stabilize = function (sort, antiStabilize) {
    return function (a, b) {
        const unstableResult = sort(a.td, b.td)

        if (unstableResult === 0) {
            if (antiStabilize) return b.index - a.index

            return a.index - b.index
        }
        return unstableResult
    }
}

Tablesort.extend = function (name, pattern, sort) {
    if (typeof pattern !== "function" || typeof sort !== "function") {
        throw new Error("Pattern and sort must be a function")
    }

    sortOptions.push({
        name,
        pattern,
        sort
    })
}

Tablesort.prototype = {

    init(el, options) {
        const that = this
        let firstRow
        let defaultSort
        let i
        let cell

        that.table = el
        that.thead = false
        that.options = options

        if (el.rows && el.rows.length > 0) {
            if (el.tHead && el.tHead.rows.length > 0) {
                for (i = 0; i < el.tHead.rows.length; i++) {
                    if (el.tHead.rows[i].getAttribute("data-sort-method") === "thead") {
                        firstRow = el.tHead.rows[i]
                        break
                    }
                }
                if (!firstRow) {
                    firstRow = el.tHead.rows[el.tHead.rows.length - 1]
                }
                that.thead = true
            } else {
                firstRow = el.rows[0]
            }
        }

        if (!firstRow) return

        const onClick = function () {
            if (that.current && that.current !== this) {
                that.current.removeAttribute("aria-sort")
            }

            that.current = this
            that.sortTable(this)
        }

        // Assume first row is the header and attach a click handler to each.
        for (i = 0; i < firstRow.cells.length; i++) {
            cell = firstRow.cells[i]
            cell.setAttribute("role", "columnheader")
            if (cell.getAttribute("data-sort-method") !== "none") {
                cell.tabindex = 0
                cell.addEventListener("click", onClick, false)

                if (cell.getAttribute("data-sort-default") !== null) {
                    defaultSort = cell
                }
            }
        }

        if (defaultSort) {
            that.current = defaultSort
            that.sortTable(defaultSort)
        }
    },

    sortTable(header, update) {
        const that = this
        const columnKey = header.getAttribute("data-sort-column-key")
        const column = header.cellIndex
        let sortFunction = caseInsensitiveSort
        let item = ""
        const items = []
        let i = that.thead ? 0 : 1
        const sortMethod = header.getAttribute("data-sort-method")
        let sortOrder = header.getAttribute("aria-sort")

        that.table.dispatchEvent(createEvent("beforeSort"))

        // If updating an existing sort, direction should remain unchanged.
        if (!update) {
            if (sortOrder === "ascending") {
                sortOrder = "descending"
            } else if (sortOrder === "descending") {
                sortOrder = "ascending"
            } else {
                sortOrder = that.options.descending ? "descending" : "ascending"
            }

            header.setAttribute("aria-sort", sortOrder)
        }

        if (that.table.rows.length < 2) return

        // If we force a sort method, it is not necessary to check rows
        if (!sortMethod) {
            var cell
            while (items.length < 3 && i < that.table.tBodies[0].rows.length) {
                if (columnKey) {
                    cell = getCellByKey(that.table.tBodies[0].rows[i].cells, columnKey)
                } else {
                    cell = that.table.tBodies[0].rows[i].cells[column]
                }

                // Treat missing cells as empty cells
                item = cell ? getInnerText(cell) : ""

                item = item.trim()

                if (item.length > 0) {
                    items.push(item)
                }

                i++
            }

            if (!items) return
        }

        for (i = 0; i < sortOptions.length; i++) {
            item = sortOptions[i]

            if (sortMethod) {
                if (item.name === sortMethod) {
                    sortFunction = item.sort
                    break
                }
            } else if (items.every(item.pattern)) {
                sortFunction = item.sort
                break
            }
        }

        that.col = column

        for (i = 0; i < that.table.tBodies.length; i++) {
            const newRows = []
            const noSorts = {}
            var j
            let totalRows = 0
            let noSortsSoFar = 0

            if (that.table.tBodies[i].rows.length < 2) continue

            for (j = 0; j < that.table.tBodies[i].rows.length; j++) {
                var cell

                item = that.table.tBodies[i].rows[j]
                if (item.getAttribute("data-sort-method") === "none") {
                    /*
                     * Keep no-sorts in separate list to be able to insert
                     * Them back at their original position later
                     */
                    noSorts[totalRows] = item
                } else {
                    if (columnKey) {
                        cell = getCellByKey(item.cells, columnKey)
                    } else {
                        cell = item.cells[that.col]
                    }
                    // Save the index for stable sorting
                    newRows.push({
                        tr: item,
                        td: cell ? getInnerText(cell) : "",
                        index: totalRows
                    })
                }
                totalRows++
            }
            /*
             * Before we append should we reverse the new array or not?
             * If we reverse, the sort needs to be `anti-stable` so that
             * The double negatives cancel out
             */
            if (sortOrder === "descending") {
                newRows.sort(stabilize(sortFunction, true))
            } else {
                newRows.sort(stabilize(sortFunction, false))
                newRows.reverse()
            }

            // Append rows that already exist rather than creating new ones
            for (j = 0; j < totalRows; j++) {
                if (noSorts[j]) {
                    // We have a no-sort row for this position, insert it here.
                    item = noSorts[j]
                    noSortsSoFar++
                } else {
                    item = newRows[j - noSortsSoFar].tr
                }

                // AppendChild(x) moves x if already present somewhere else in the DOM
                that.table.tBodies[i].appendChild(item)
            }
        }

        that.table.dispatchEvent(createEvent("afterSort"))
    },

    refresh() {
        if (this.current !== undefined) {
            this.sortTable(this.current, true)
        }
    }
}

export {Tablesort}
