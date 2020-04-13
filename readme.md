
Stardew Valley Item Finder
===============================

Instructions
------------

The save file is of the form `Name_123456789`. It can be found
in the following folders.

-   Windows: `%appdata%\StardewValley\Saves`
-   Linux and macOS: `~/.config/StardewValley/Saves`

You can sort the table by clicking on the headers, and you can download
the table as a `CSV` file to use in Excel.

About
-----

Currently, this tool does *not* account for any professions, which can
make some of the prices inaccurate at higher skill levels.

This tool runs entirely inside the browser. Your save file is never sent
across the network.

Source code repository located at
<https://github.com/gucci-on-fleek/Stardew-Valley-Item-Finder>.
Inspired by the [Stardew Fair
Helper](https://mouseypounds.github.io/stardew-fair-helper/).

Command Line Usage
------------------

Advanced users can convert their save files to `CSV` on the command line. First, you'll need to download the `xslt` files from the [source code repository](https://github.com/gucci-on-fleek/Stardew-Valley-Item-Finder). Then, using [`xsltproc`](http://xmlsoft.org/XSLT/xsltproc.html):
```bash
xsltproc items.xslt Name_123456789 | xsltproc items-to-csv.xslt - > items.csv
```

Licencing
---------

All files in this repository are licensed under the [MPL version 2 or later](https://www.mozilla.org/en-US/MPL/2.0/). This excludes the files in the `libraries` folder, which are licensed as stated in each file. The files in the `assets` folder belong to ConcernedApe and are used under fair use.
