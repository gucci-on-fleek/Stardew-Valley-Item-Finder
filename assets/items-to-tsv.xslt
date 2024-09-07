<?xml version="1.0" encoding="utf-8"?>
<!--{{ regexReplaceAll `<![-]-[^\0]*?[-]->\s*|\s*(\n)\s*|([^-\w<!])\s+([^-\w<!])` `-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <!-- Stardew Valley Item Finder
         https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
         SPDX-License-Identifier: MPL-2.0+
         SPDX-FileCopyrightText: 2024 Max Chernoff
    -->
    <xsl:output method="text" encoding="utf-8" />
    <xsl:variable name="col_sep" select="'&#x9;'" />
    <xsl:variable name="row_sep" select="'&#xA;'" />

    <xsl:template match="/items">
        <xsl:value-of select="concat('Item Name', $col_sep)" />
        <xsl:value-of select="concat('Quality', $col_sep)" />
        <xsl:value-of select="concat('Price', $col_sep)" />
        <xsl:value-of select="concat('Count', $col_sep)" />
        <xsl:value-of select="concat('Stored in', $col_sep)" />
        <xsl:value-of select="concat('Stack Price', $row_sep)" />

        <xsl:for-each select="item">
            <xsl:sort select="actual_price * count" data-type="number" order="descending" />
            <xsl:value-of select="concat(normalize-space(name), $col_sep)" />
            <xsl:choose>
                <xsl:when test="quality">
                    <xsl:value-of select="concat(quality, $col_sep)" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$col_sep" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of select="concat(normalize-space(actual_price), $col_sep)" />
            <xsl:value-of select="concat(normalize-space(count), $col_sep)" />
            <xsl:choose>
                <xsl:when test="contained_in/type = 'Player'">
                    <xsl:value-of select="concat('Player (', normalize-space(contained_in/description), ')', $col_sep)" />
                </xsl:when>
                <xsl:when test="contained_in/description">
                    <xsl:value-of select="concat(normalize-space(contained_in/description), ' ', normalize-space(contained_in/type), ' (', normalize-space(contained_in/location), ')', $col_sep)" />
                </xsl:when>
                <xsl:when test="contained_in/type = contained_in/location">
                    <!--Junimo Hut-->
                    <xsl:value-of select="concat(normalize-space(contained_in/type), $col_sep)" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat(normalize-space(contained_in/type), ' (', normalize-space(contained_in/location), ')', $col_sep)" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of select="concat(actual_price * count, $row_sep)" />
        </xsl:for-each>
    </xsl:template>

</xsl:stylesheet>
<!--` "${1}${2}${3}" }}-->
