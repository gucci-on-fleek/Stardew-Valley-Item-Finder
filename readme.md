Stardew Valley Item Finder
==========================

This tool extracts information about all of your items in Stardew Valley
and displays it in a table. The table shows the items’ names, locations,
and prices.

Instructions
------------

You’ll need to upload your save file below to begin. Your save file is
named `Name_123456789`, where `Name` is your player’s name and
`123456789` is a random 9-digit number. The save file can be found in [one of the following folders](https://stardewvalleywiki.com/Saves#Find_your_save_files):

-   Windows: `%appdata%\StardewValley\Saves`
-   Linux and macOS: `~/.config/StardewValley/Saves`

You can sort the table by clicking on the headers, and you can download
the table as a `CSV` file to use in Excel.

Currently, this tool does *not* account for any professions or special
events. This may lead to some prices being slightly inaccurate for your
specific character.

About
-----

This tool runs entirely inside the browser. Your save file is never sent
across the network.

Source code repository located at
<https://github.com/gucci-on-fleek/Stardew-Valley-Item-Finder>. Inspired
by the [Stardew Fair
Helper](https://mouseypounds.github.io/stardew-fair-helper/).

Advanced Usage
--------------

### Running from the Command Line

Advanced users can convert their save files to `CSV` on the command
line. First, you’ll need to download the `xslt` files from the [source
code
repository](https://github.com/gucci-on-fleek/Stardew-Valley-Item-Finder).
Then, using [`xsltproc`](http://xmlsoft.org/XSLT/xsltproc.html):

```bash
xsltproc items.xslt Name_123456789 | xsltproc items-to-csv.xslt - > items.csv
```

### Regular Expressions

The filter fully supports Regular Expressions. For most users, the
most important part is that you can search for multiple items at a time
by separating them with a pipe (`|`). For example, to show all carrots
and potatoes, you would type `carrot|potato`.

### Offline Use

This tool fully supports offline usage. After the first load, no internet access is required.

Developing
----------

### Building
The tool does not need to be build to be run. You can run your own copy of the tool with any simple webserver, like `python -m http.server`. If you want to minify the files, see [the build script](.github/workflows/pages-deploy.yaml) for reference.

### Documentation
The non-standard `@effects` tag is used to indicate if a function has side effects.

Licencing
---------

All files in this repository are licensed under the [MPL version 2 or later](https://www.mozilla.org/en-US/MPL/2.0/). This excludes the files in the `libraries` folder, which are licensed as stated in each file. The files in the `assets` folder belong to ConcernedApe and are used under fair use.
