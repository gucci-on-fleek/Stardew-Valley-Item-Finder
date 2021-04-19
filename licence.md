Licencing
=========
<!-- Stardew Valley Item Finder
     https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
     SPDX-License-Identifier: MPL-2.0+ OR CC-BY-SA-4.0+
     SPDX-FileCopyrightText: 2021 gucci-on-fleek
-->

This file is the licence that governs all files and contributions present in [github.com/gucci-on-fleek/Stardew-Valley-Item-Finder](https://github.com/gucci-on-fleek/Stardew-Valley-Item-Finder).

### A quick note ###
**If you are merely a user of this website, none of this is relevant to you. This licence  only applies if you distribute the software or any of its components.**

Overview
--------
Each file should contain the string `SPDX-License-Identifier` somewhere near the top. After this string, there should be a colon followed by the name of a licence that can be found in the `licences/` folder. This licence represents the terms under which the file is licensed. 

This project uses a few different licences, but all of them meet the [FSF “Free Software”](https://www.gnu.org/philosophy/free-sw.html) and the [OSI “Open Source”](https://opensource.org/osd) definitions. In addition, none of the licences are “Strong Copyleft” (i.e. GPL), so there are no onerous requirements for distribution if you make any modifications.

Specific Files and Folders
--------------------------

### `assets/` ###
The `.png` and `.svg` files present in the `assets/` folder are unlicensed. These files were either directly extracted from *Stardew Valley*’s files or are very basic derivatives thereof. However, this is not an issue since the principles of Fair Use allow for them to be used freely for a number of reasons:
1. The largest original file is 24×24 and has 14 unique colours. An icon this simple does not necessarily meet the threshold of originality required for copyright.
2. These files are used directly in the context of the game for which they were released. The website where these icons are used does not compete in any way with the game; rather, it enhances the game.
3. The creator, ConcernedApe, has generally had a pretty friendly attitude towards modders and others who create content derived from the game.

### `libraries/` ###
All of the files in the `libraries/` folder are third-party libraries. These files are not my own creation, and are licensed as shown in each file.

### Documentation (`*.md`) ###
Any markdown files or documentation are dual-licensed under the MPL ≥v2.0 or CC-BY-SA ≥v4.0. This means that you may choose either licence at your discretion. Note that if a documentation file has an explicit licence that contradicts these terms, that licence supersedes the one listed here.

### Wiki Content ###
When you click on an item on the website, the website makes a network request to the *Stardew Valley Wiki*. The content in the Wiki is licensed under CC-BY-NC-SA-3.0. There are no files from the Wiki present in this repository, but a Wiki excerpt appears when a network request is made.

### Other Files ###
Any files not mentioned above or without a licence header can be assumed to be licensed under the MPL ≥v2.0.

Requirements for Distribution
-----------------------------
*Note: this is a summary of the legal licence terms, not a legally binding licence. See the `licences/` directory for the true license.*

Almost all of the files in the repository are licensed under the MPL ≥v2.0. In general, this licence has two requirements for distribution:
1. The licence must be distributed with the software
2. The source must be made available for any files modified. However, the source does *not* need to be made available for any new files that you add. Any new files that you add can be made available under any licence.
