_Stardew Valley_ Item Finder
==========================

**[Launch Now](https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/)**

<!-- Stardew Valley Item Finder
     https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
     SPDX-License-Identifier: MPL-2.0+ OR CC-BY-SA-4.0+
     SPDX-FileCopyrightText: 2021 gucci-on-fleek
-->

This tool extracts information about all of your items in _Stardew Valley_
and displays it in a table. The table shows the items’ names, locations,
and prices.

Instructions
------------

This tool requires your save file. Your save file is
named `Name_123456789`, where `Name` is your player’s name and
`123456789` is a random 9-digit number. The save file can be found in [one of the following folders](https://stardewvalleywiki.com/Saves#Find_your_save_files):

-   Windows: `%appdata%\StardewValley\Saves`
-   Linux and macOS: `~/.config/StardewValley/Saves`

You can sort the table by clicking on the headers, and you can download
the table as a `CSV` file to use in Excel. You can also click on an item name to view its description from the *Stardew Valley Wiki*.

About
-----

This tool runs entirely inside the browser. Your save file is never sent
across the network.

Source code repository located at
<https://github.com/gucci-on-fleek/Stardew-Valley-Item-Finder>. Inspired
by the [Stardew Fair
Helper](https://mouseypounds.github.io/stardew-fair-helper/).

For support, feedback, and general questions, please [submit an issue](https://github.com/gucci-on-fleek/Stardew-Valley-Item-Finder/issues/new/choose) on GitHub.

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

### Architecture
This webapp is divided into two main components: processing and display. These elements are fairly independent of each other and can each be easily repurposed for other uses. In fact, feel free to repurpose any of components for your own use.

#### Processing
All of the data is processed using XML Stylesheet Transformations (`XSLT`). There are two separate steps: the first conversion of the save file to an intermediate `XML` file, and a second conversion from the intermediate `XML` file to a final `CSV` file. 

For developers, the first step is likely of the greatest interest. This first step (found in `items.xslt`) can convert any _Stardew Valley_ save into a more basic `XML` file that is easy to parse. You can see how this works by running the transforms from the command-line as demonstrated above or by viewing `items.xsd` and `items.xslt`. These files are lacking in documentation, but they should be fairly self-explanatory if you have a bit of `XML` experience.

#### Display
After the save file has been transformed to `CSV`, the rest of the webapp is essentially just a fancy `CSV` display. Seriously, most of the functions in `item-finder.js` are general-purpose; the only function specific to Stardew Valley is `replace_icon()`. All of the JavaScript is extensively documented, although some of the `CSS` is missing comments.

### Building
The tool does not need to be build to be run. You can run your own copy of the tool with any simple webserver, like `python -m http.server`. 

If you want to minify the files, you'll need to run `./build.sh`. If you are on Ubuntu/Debian, you can install the dependencies using `./build.sh install_dependencies`. Otherwise, you'll need to install the packages some other way. Once the dependencies are installed, just run `./build.sh minify` and you'll be good to go!

### Documentation
The non-standard `@effects` tag is used to indicate if a function has side effects.

Licencing
---------

See [`licence.md`](licence.md).
