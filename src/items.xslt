<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- Stardew Valley Item Finder
     https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
     SPDX-License-Identifier: MPL-2.0+
     SPDX-FileCopyrightText: 2021 gucci-on-fleek
-->
  <xsl:output method="xml" indent="yes" />

  <!-- Global Variables -->
  <xsl:variable name="professions" select="/SaveGame/player/professions" />
  <xsl:variable name="events" select="/SaveGame/player/eventsSeen" />
  <xsl:variable name="profit_margin" select="/SaveGame/player/difficultyModifier" />

  <xsl:template match="*/items">
    <xsl:for-each select="Item[@xsi:type='Object' or @xsi:type='ColoredObject']">
      <!-- Roe is a 'ColoredObject', everything else is an object. -->
      <item>
        <name>
          <xsl:value-of select="Name" />
        </name>
        <xsl:if test="quality &gt; 0">
          <quality>
            <xsl:call-template name="quality_name">
              <xsl:with-param name="quality" select="quality" />
            </xsl:call-template>
          </quality>
        </xsl:if>
        <count>
          <xsl:value-of select="Stack" />
        </count>
        <actual_price>
          <xsl:call-template name="price_adjustments">
            <xsl:with-param name="id" select="parentSheetIndex" />
            <xsl:with-param name="category" select="-1 * category" />
            <xsl:with-param name="base_price" select="price" />
            <xsl:with-param name="professions" select="$professions" />
            <xsl:with-param name="events" select="$events" />
            <xsl:with-param name="quality" select="quality" />
            <xsl:with-param name="foraged" select="isSpawnedObject=true" /> <!-- According to the xpath spec, any non-empty string is truthy, so we need to explicitly test against 'true' -->
            <xsl:with-param name="profit_margin" select="$profit_margin" />
          </xsl:call-template>
        </actual_price>
        <contained_in>
          <xsl:variable name="parent_items" select="parent::items" />
          <xsl:choose>
            <xsl:when test="$parent_items/parent::player">
              <type>Player</type>
              <!-- Do not include a location for the player since they can move -->
              <description>
                <xsl:value-of select="$parent_items/parent::player/name" />
              </description>
            </xsl:when>
            <xsl:when test="$parent_items/parent::fridge">
              <type>Fridge</type>
              <xsl:call-template name="location" />
            </xsl:when>
            <xsl:when test="$parent_items/parent::Object/Name">
              <!-- Mini-Fridges, etc. -->
              <type>
                <xsl:value-of select="$parent_items/parent::Object/Name" />
              </type>
              <xsl:if test="$parent_items/parent::Object/playerChoiceColor">
                <xsl:call-template name="colours">
                  <xsl:with-param name="num" select="$parent_items/parent::Object/playerChoiceColor/PackedValue" />
                </xsl:call-template>
              </xsl:if>
              <xsl:call-template name="location" />
            </xsl:when>
            <xsl:when test="$parent_items/parent::heldObject/parent::Object/Name">
              <!-- Autopickers -->
              <type>
                <xsl:value-of select="$parent_items/parent::heldObject/parent::Object/Name" />
              </type>
              <xsl:call-template name="location" />
            </xsl:when>
            <xsl:when test="$parent_items/parent::output/parent::Building">
              <!-- Junimo Huts, Mills, etc. -->
              <type>
                <xsl:value-of select="$parent_items/parent::output/parent::Building/buildingType" />
              </type>
              <xsl:call-template name="location" />
            </xsl:when>
          </xsl:choose>
        </contained_in>
        <internal_information>
          <base_price>
            <xsl:value-of select="price" />
          </base_price>
          <id>
            <xsl:value-of select="parentSheetIndex" /> <!-- The game uses 'parentSheetIndex' like a unique ID value -->
          </id>
          <category>
            <xsl:value-of select="-1 * category" /> <!-- All categories are >=0 for some reason, so lets make them positive -->
          </category>
        </internal_information>
      </item>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="/">
    <!-- Wrap all 'item's in a root 'item' node -->
    <items>
      <xsl:attribute name="xsi:noNamespaceSchemaLocation">https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/src/items.xsd</xsl:attribute> <!-- Include schema -->
      <xsl:apply-templates />
    </items>
  </xsl:template>

  <xsl:template match="text()|@*"></xsl:template> <!-- Only output matching elements -->

  <xsl:template name="colours">
    <!-- Convert packed colour values to a human-readable name -->
    <xsl:param name="num" />
    <xsl:choose>
      <xsl:when test="$num=4294923605">
        <description>Dark Blue</description>
      </xsl:when>
      <xsl:when test="$num=4294950775">
        <description>Light Blue</description>
      </xsl:when>
      <xsl:when test="$num=4289374720">
        <description>Dark Teal</description>
      </xsl:when>
      <xsl:when test="$num=4289718784">
        <description>Light Teal</description>
      </xsl:when>
      <xsl:when test="$num=4278233600">
        <description>Dark Green</description>
      </xsl:when>
      <xsl:when test="$num=4278250655">
        <description>Light Green</description>
      </xsl:when>
      <xsl:when test="$num=4279429887">
        <description>Yellow</description>
      </xsl:when>
      <xsl:when test="$num=4279412735">
        <description>Amber</description>
      </xsl:when>
      <xsl:when test="$num=4279396863">
        <description>Orange</description>
      </xsl:when>
      <xsl:when test="$num=4278190335">
        <description>Red</description>
      </xsl:when>
      <xsl:when test="$num=4280483975">
        <description>Dark Red</description>
      </xsl:when>
      <xsl:when test="$num=4291276287">
        <description>Pale Pink</description>
      </xsl:when>
      <xsl:when test="$num=4290999807">
        <description>Bright Pink</description>
      </xsl:when>
      <xsl:when test="$num=4291166380">
        <description>Magenta</description>
      </xsl:when>
      <xsl:when test="$num=4294901903">
        <description>Purple</description>
      </xsl:when>
      <xsl:when test="$num=4287499097">
        <description>Dark Purple</description>
      </xsl:when>
      <xsl:when test="$num=4282400832">
        <description>Black</description>
      </xsl:when>
      <xsl:when test="$num=4284769380">
        <description>Dark Grey</description>
      </xsl:when>
      <xsl:when test="$num=4291348680">
        <description>Light Grey</description>
      </xsl:when>
      <xsl:when test="$num=4294901502">
        <description>White</description>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="quality_name">
    <!-- Convert quality numbers to a quality name -->
    <xsl:param name="quality" />
    <xsl:choose>
      <xsl:when test="$quality=1">Silver</xsl:when>
      <xsl:when test="$quality=2">Gold</xsl:when>
      <xsl:when test="$quality=4">Iridium</xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="location">
    <location>
      <xsl:value-of select="ancestor::GameLocation/name" />
    </location>
  </xsl:template>

  <xsl:include href="src/price-adjustments.xslt" /> <!-- Import the price adjustments from a separate file -->

</xsl:stylesheet>
