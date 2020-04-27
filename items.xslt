<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <!-- Stardew Valley Item Finder
     https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
     Licensed under MPL 2.0 or greater. See URL for more information.
-->
  <xsl:output method="xml" indent="yes" />
  <xsl:template match="*/items">
    <xsl:for-each select="Item">
      <xsl:if test="price">
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
            <xsl:call-template name="quality_price_adjust">
              <xsl:with-param name="quality" select="quality" />
              <xsl:with-param name="base_price" select="price" />
            </xsl:call-template>
          </actual_price>
          <xsl:choose>
            <xsl:when test="parent::items/parent::player">
              <contained_in>
                <type>Player</type>
                <description>
                  <xsl:value-of select="parent::items/parent::player/name" />
                </description>
              </contained_in>
            </xsl:when>
            <xsl:when test="parent::items/parent::fridge">
              <contained_in>
                <type>Fridge</type>
              </contained_in>
            </xsl:when>
            <xsl:when test="parent::items/parent::Object/Name">
              <contained_in>
                <type>
                  <xsl:value-of select="parent::items/parent::Object/Name" />
                </type>
                <xsl:if test="parent::items/parent::Object/playerChoiceColor">
                  <description>
                    <xsl:call-template name="colours">
                      <xsl:with-param name="num" select="parent::items/parent::Object/playerChoiceColor/PackedValue" />
                    </xsl:call-template>
                  </description>
                </xsl:if>
              </contained_in>
            </xsl:when>
            <xsl:when test="parent::items/parent::heldObject/parent::Object/Name">
              <contained_in>
                <type>
                  <xsl:value-of select="parent::items/parent::heldObject/parent::Object/Name" />
                </type>
              </contained_in>
            </xsl:when>
          </xsl:choose>
          <internal_information>
            <base_price>
              <xsl:value-of select="price" />
            </base_price>
            <id>
              <xsl:value-of select="parentSheetIndex" />
            </id>
            <category>
              <xsl:value-of select="category" />
            </category>
          </internal_information>
        </item>
      </xsl:if>
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

  <xsl:template name="quality_price_adjust">
    <xsl:param name="base_price" />
    <xsl:param name="quality" />
    <xsl:choose>
      <xsl:when test="$quality=1">
        <xsl:value-of select="floor($base_price * 1.25)" />
      </xsl:when>
      <xsl:when test="$quality=2">
        <xsl:value-of select="floor($base_price * 1.50)" />
      </xsl:when>
      <xsl:when test="$quality=4">
        <xsl:value-of select="floor($base_price * 2.00)" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$base_price" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
