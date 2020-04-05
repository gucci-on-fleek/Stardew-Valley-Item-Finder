<?xml version="1.0" encoding="utf8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
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
          <xsl:if test="parent::items/parent::player">
            <contained_in>
              <type>Player</type>
              <name>
                <xsl:value-of select="parent::items/parent::player/name" />
              </name>
            </contained_in>
          </xsl:if>
          <xsl:if test="parent::items/parent::fridge">
            <in>
              <type>Fridge</type>
            </in>
          </xsl:if>
          <xsl:if test="parent::items/parent::Object/Name">
            <contained_in>
              <type>
                <xsl:value-of select="parent::items/parent::Object/Name" />
              </type>
              <xsl:if test="parent::items/parent::Object/playerChoiceColor">
                <colour>
                  <xsl:call-template name="colours">
                    <xsl:with-param name="num" select="parent::items/parent::Object/playerChoiceColor/PackedValue" />
                  </xsl:call-template>
                </colour>
              </xsl:if>
            </contained_in>
          </xsl:if>
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
    <xsl:if test="$num=4278190080">Brown</xsl:if>
    <xsl:if test="$num=4294923605">Dark Blue</xsl:if>
    <xsl:if test="$num=4294950775">Light Blue</xsl:if>
    <xsl:if test="$num=4289374720">Dark Blue-Green</xsl:if>
    <xsl:if test="$num=4289718784">Light Blue-Green</xsl:if>
    <xsl:if test="$num=4278233600">Dark Green</xsl:if>
    <xsl:if test="$num=4278250655">Light Green</xsl:if>
    <xsl:if test="$num=4279429887">Yellow</xsl:if>
    <xsl:if test="$num=4279412735">Yellow-Orange</xsl:if>
    <xsl:if test="$num=4279396863">Orange</xsl:if>
    <xsl:if test="$num=4278190335">Red</xsl:if>
    <xsl:if test="$num=4280483975">Dark Red</xsl:if>
    <xsl:if test="$num=4291276287">Pale Pink</xsl:if>
    <xsl:if test="$num=4290999807">Bright Pink</xsl:if>
    <xsl:if test="$num=4291166380">Magenta</xsl:if>
    <xsl:if test="$num=4294901903">Purple</xsl:if>
    <xsl:if test="$num=4287499097">Dark Purple</xsl:if>
    <xsl:if test="$num=4282400832">Black</xsl:if>
    <xsl:if test="$num=4284769380">Dark Grey</xsl:if>
    <xsl:if test="$num=4291348680">Light Grey</xsl:if>
    <xsl:if test="$num=4294901502">White</xsl:if>
  </xsl:template>

  <xsl:template name="quality_name">
    <xsl:param name="quality" />
    <xsl:if test="$quality=1">Silver</xsl:if>
    <xsl:if test="$quality=2">Gold</xsl:if>
    <xsl:if test="$quality=4">Iridium</xsl:if>
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
