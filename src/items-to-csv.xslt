<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <!-- Stardew Valley Item Finder
     https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
     SPDX-License-Identifier: MPL-2.0+
     SPDX-FileCopyrightText: 2024 Max Chernoff
-->
    <xsl:output method="text" encoding="utf-8" />

    <xsl:variable name="col_sep" select="';'" />
    <xsl:variable name="quote" select="''" />

    <xsl:template match="/items">
        <xsl:value-of select="concat($quote, 'Item Name', $quote, $col_sep)" />
        <xsl:value-of select="concat($quote, 'Quality', $quote, $col_sep)" />
        <xsl:value-of select="concat($quote, 'Price', $quote, $col_sep)" />
        <xsl:value-of select="concat($quote, 'Count', $quote, $col_sep)" />
        <xsl:value-of select="concat($quote, 'Stored in', $quote, $col_sep)" />
        <xsl:value-of select="concat($quote, 'Stack Price', $quote)" />
        <xsl:text> &#xA; </xsl:text>

        <xsl:for-each select="item">
            <xsl:sort select="actual_price * count" data-type="number" order="descending" />
            <xsl:value-of select="concat($quote, normalize-space(name), $quote, $col_sep)" />
            <xsl:choose>
                <xsl:when test="quality">
                    <xsl:value-of select="concat($quote, quality, $quote, $col_sep)" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat($quote, $quote, $col_sep)" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of select="concat($quote, normalize-space(actual_price), $quote, $col_sep)" />
            <xsl:value-of select="concat($quote, normalize-space(count), $quote, $col_sep)" />
            <xsl:choose>
                <xsl:when test="contained_in/type = 'Player'">
                    <xsl:value-of select="concat($quote, 'Player (', normalize-space(contained_in/description), ')', $quote, $col_sep)" />
                </xsl:when>
                <xsl:when test="contained_in/description">
                    <xsl:value-of select="concat($quote, normalize-space(contained_in/description), ' ', normalize-space(contained_in/type), ' (', normalize-space(contained_in/location), ')', $quote, $col_sep)" />
                </xsl:when>
                <xsl:when test="contained_in/type = contained_in/location">
                    <!--Junimo Hut-->
                    <xsl:value-of select="concat($quote, normalize-space(contained_in/type), $quote, $col_sep)" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat($quote, normalize-space(contained_in/type), ' (', normalize-space(contained_in/location), ')', $quote, $col_sep)" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of select="concat($quote, actual_price * count, $quote)" />
            <xsl:text>&#xA; </xsl:text>
        </xsl:for-each>
    </xsl:template>

</xsl:stylesheet>
