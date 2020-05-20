<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- Stardew Valley Item Finder
     https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
     Licensed under MPL 2.0 or greater. See URL for more information.
-->
  <xsl:output method="xml" indent="yes" />

  <xsl:variable name="professions" select="/SaveGame/player/professions" />
  <xsl:variable name="events" select="/SaveGame/player/eventsSeen" />
  <xsl:variable name="profit_margin" select="/SaveGame/player/difficultyModifier" />

  <xsl:template match="*/items">
    <xsl:for-each select="Item[@xsi:type='Object']">
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
            <xsl:with-param name="foraged" select="isSpawnedObject=true" />
            <xsl:with-param name="profit_margin" select="$profit_margin" />
          </xsl:call-template>
        </actual_price>
        <contained_in>
          <xsl:variable name="parent_items" select="parent::items" />
          <xsl:choose>
            <xsl:when test="$parent_items/parent::player">
              <type>Player</type>
              <description>
                <xsl:value-of select="$parent_items/parent::player/name" />
              </description>
            </xsl:when>
            <xsl:when test="$parent_items/parent::fridge">
              <type>Fridge</type>
              <xsl:call-template name="location" />
            </xsl:when>
            <xsl:when test="$parent_items/parent::Object/Name">
              <type>
                <xsl:value-of select="$parent_items/parent::Object/Name" />
              </type>
              <xsl:if test="$parent_items/parent::Object/playerChoiceColor">
                <description>
                  <xsl:call-template name="colours">
                    <xsl:with-param name="num" select="$parent_items/parent::Object/playerChoiceColor/PackedValue" />
                  </xsl:call-template>
                </description>
              </xsl:if>
              <xsl:call-template name="location" />
            </xsl:when>
            <xsl:when test="$parent_items/parent::heldObject/parent::Object/Name">
              <type>
                <xsl:value-of select="$parent_items/parent::heldObject/parent::Object/Name" />
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
            <xsl:value-of select="parentSheetIndex" />
          </id>
          <category>
            <xsl:value-of select="-1 * category" />
          </category>
        </internal_information>
      </item>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="/">
    <items>
      <xsl:apply-templates />
    </items>
  </xsl:template>

  <xsl:template match="text()|@*"></xsl:template>

  <xsl:template name="colours">
    <xsl:param name="num" />
    <xsl:choose>
      <xsl:when test="$num=4278190080">Brown</xsl:when>
      <xsl:when test="$num=4294923605">Dark Blue</xsl:when>
      <xsl:when test="$num=4294950775">Light Blue</xsl:when>
      <xsl:when test="$num=4289374720">Dark Blue–Green</xsl:when>
      <xsl:when test="$num=4289718784">Light Blue–Green</xsl:when>
      <xsl:when test="$num=4278233600">Dark Green</xsl:when>
      <xsl:when test="$num=4278250655">Light Green</xsl:when>
      <xsl:when test="$num=4279429887">Yellow</xsl:when>
      <xsl:when test="$num=4279412735">Yellow–Orange</xsl:when>
      <xsl:when test="$num=4279396863">Orange</xsl:when>
      <xsl:when test="$num=4278190335">Red</xsl:when>
      <xsl:when test="$num=4280483975">Dark Red</xsl:when>
      <xsl:when test="$num=4291276287">Pale Pink</xsl:when>
      <xsl:when test="$num=4290999807">Bright Pink</xsl:when>
      <xsl:when test="$num=4291166380">Magenta</xsl:when>
      <xsl:when test="$num=4294901903">Purple</xsl:when>
      <xsl:when test="$num=4287499097">Dark Purple</xsl:when>
      <xsl:when test="$num=4282400832">Black</xsl:when>
      <xsl:when test="$num=4284769380">Dark Grey</xsl:when>
      <xsl:when test="$num=4291348680">Light Grey</xsl:when>
      <xsl:when test="$num=4294901502">White</xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="quality_name">
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

  <xsl:include href="price-adjustments.xslt" />

</xsl:stylesheet>
