<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <!-- Stardew Valley Item Finder
         https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
         SPDX-License-Identifier: MPL-2.0+
         SPDX-FileCopyrightText: 2022 Max Chernoff
    -->

    <!-- Constants -->
    <!-- Professions -->
    <xsl:variable name="rancher" select="0" />
    <xsl:variable name="tiller" select="1" />
    <xsl:variable name="artisan" select="4" />
    <xsl:variable name="fisher" select="6" />
    <xsl:variable name="angler" select="8" />
    <xsl:variable name="tapper" select="15" />
    <xsl:variable name="blacksmith" select="20" />
    <xsl:variable name="gemologist" select="23" />

    <!-- Events -->
    <xsl:variable name="bears_knowledge" select="2120303" />
    <xsl:variable name="spring_onion" select="3910979" />

    <!-- Special Items -->
    <xsl:variable name="cranberry_seeds" select="493" />

    <xsl:template name="price_adjustments">
        <xsl:param name="id" />
        <xsl:param name="category" />
        <xsl:param name="base_price" />
        <xsl:param name="professions" />
        <xsl:param name="events" />
        <xsl:param name="quality" />
        <xsl:param name="foraged" />
        <xsl:param name="profit_margin" />

        <xsl:choose>
            <xsl:when test="($category=2 or $category=12) and $professions[int=$gemologist]">
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="1.3" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="$profit_margin" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="$category=4 and $professions[int=$fisher]">
                <xsl:choose>
                    <xsl:when test="$professions[int=$angler]">
                        <xsl:call-template name="print_price">
                            <xsl:with-param name="multiplier" select="1.5" />
                            <xsl:with-param name="quality" select="$quality" />
                            <xsl:with-param name="profit_margin" select="$profit_margin" />
                            <xsl:with-param name="base_price" select="$base_price" />
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="print_price">
                            <xsl:with-param name="multiplier" select="1.25" />
                            <xsl:with-param name="quality" select="$quality" />
                            <xsl:with-param name="profit_margin" select="$profit_margin" />
                            <xsl:with-param name="base_price" select="$base_price" />
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>

            <xsl:when test="($category=5 or $category=6 or $category=18) and $professions[int=$rancher]">
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="1.2" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="$profit_margin" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="$category=8 and ($id=298 or $id=322 or $id=323 or $id=324)">
                <!-- Fences -->
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="1" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="1" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="$category=15 and $professions[int=$blacksmith] and ($id=298 or $id=322 or $id=323 or $id=324)">
                <!-- Bars -->
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="1.5" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="$profit_margin" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="$category=22">
                <!-- Tackle -->
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="1" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="1" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="$category=26">
                <xsl:choose>
                    <xsl:when test="$professions[int=$artisan] and not($professions[int=$rancher])">
                        <xsl:call-template name="print_price">
                            <xsl:with-param name="multiplier" select="1.4" />
                            <xsl:with-param name="quality" select="$quality" />
                            <xsl:with-param name="profit_margin" select="$profit_margin" />
                            <xsl:with-param name="base_price" select="$base_price" />
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:when test="not($professions[int=$artisan]) and $professions[int=$rancher] and ($id=306 or $id=307 or $id=308 or $id=424 or $id=426 or $id=428 or $id=440 or $id=807)">
                        <!-- The id list is equilvalent to /mayonnaise|cheese|wool|cloth/i.match(name) -->
                        <xsl:call-template name="print_price">
                            <xsl:with-param name="multiplier" select="1.2" />
                            <xsl:with-param name="quality" select="$quality" />
                            <xsl:with-param name="profit_margin" select="$profit_margin" />
                            <xsl:with-param name="base_price" select="$base_price" />
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:when test="$professions[int=$artisan] and $professions[int=$rancher] and ($id=306 or $id=307 or $id=308 or $id=424 or $id=426 or $id=428 or $id=440 or $id=807)">
                        <xsl:call-template name="print_price">
                            <xsl:with-param name="multiplier" select="1.68" />
                            <xsl:with-param name="quality" select="$quality" />
                            <xsl:with-param name="profit_margin" select="$profit_margin" />
                            <xsl:with-param name="base_price" select="$base_price" />
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="print_price">
                            <xsl:with-param name="multiplier" select="1" />
                            <xsl:with-param name="quality" select="$quality" />
                            <xsl:with-param name="profit_margin" select="$profit_margin" />
                            <xsl:with-param name="base_price" select="$base_price" />
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>

            <xsl:when test="$category=27 and $professions[int=$tapper]">
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="1.25" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="$profit_margin" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="$id=$cranberry_seeds">
                <!-- Weird special case found in Objects.cs -->
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="0.5" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="$profit_margin" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="($category=75 or $category=80) and $professions[int=$tiller]">
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="1.1" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="$profit_margin" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="$category=79">
                <xsl:choose>
                    <xsl:when test="$events[int=$bears_knowledge] and ($id=410 or $id=296)">
                        <xsl:call-template name="print_price">
                            <xsl:with-param name="multiplier" select="3" />
                            <xsl:with-param name="quality" select="$quality" />
                            <xsl:with-param name="profit_margin" select="$profit_margin" />
                            <xsl:with-param name="base_price" select="$base_price" />
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:when test="$professions[int=$tiller] and not($foraged)">
                        <xsl:call-template name="print_price">
                            <xsl:with-param name="multiplier" select="1.1" />
                            <xsl:with-param name="quality" select="$quality" />
                            <xsl:with-param name="profit_margin" select="$profit_margin" />
                            <xsl:with-param name="base_price" select="$base_price" />
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="print_price">
                            <xsl:with-param name="multiplier" select="1" />
                            <xsl:with-param name="quality" select="$quality" />
                            <xsl:with-param name="profit_margin" select="$profit_margin" />
                            <xsl:with-param name="base_price" select="$base_price" />
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>

            <xsl:when test="$category=81 and ($events[int=$spring_onion] and $id=399)">
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="5" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="$profit_margin" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:otherwise>
                <xsl:call-template name="print_price">
                    <xsl:with-param name="multiplier" select="1" />
                    <xsl:with-param name="quality" select="$quality" />
                    <xsl:with-param name="profit_margin" select="$profit_margin" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="print_price">
        <xsl:param name="quality" />
        <xsl:param name="multiplier" />
        <xsl:param name="profit_margin" />
        <xsl:param name="base_price" />

        <xsl:choose>
            <xsl:when test="$quality=1">
                <xsl:call-template name="one_or_value">
                    <xsl:with-param name="value" select="floor(1.25 * $multiplier * $profit_margin * $base_price)" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="$quality=2">
                <xsl:call-template name="one_or_value">
                    <xsl:with-param name="value" select="floor(1.50 * $multiplier * $profit_margin * $base_price)" />
                </xsl:call-template>
            </xsl:when>

            <xsl:when test="$quality=4">
                <xsl:call-template name="one_or_value">
                    <xsl:with-param name="value" select="floor(2.00 * $multiplier * $profit_margin * $base_price)" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:when>

            <xsl:otherwise>
                <xsl:call-template name="one_or_value">
                    <xsl:with-param name="value" select="floor(1.00 * $multiplier * $profit_margin * $base_price)" />
                    <xsl:with-param name="base_price" select="$base_price" />
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="one_or_value">
        <!-- There is no max() function in xslt, so this is a substitute -->
        <xsl:param name="value" />
        <xsl:param name="base_price" />
        <xsl:choose>
            <xsl:when test="$value>=1 or $base_price=0">
                <xsl:value-of select="$value" />
            </xsl:when>

            <xsl:otherwise>
                <xsl:value-of select="1" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>
