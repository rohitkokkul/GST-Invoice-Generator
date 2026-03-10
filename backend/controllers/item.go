package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rohitkokkul/gst-invoice-backend/database"
	"github.com/rohitkokkul/gst-invoice-backend/models"
)

// CreateItem creates a new line item under a specific tenant
func CreateItem(c *gin.Context) {
	tenantIDRaw := c.Param("tenantId")
	tenantID, err := strconv.ParseUint(tenantIDRaw, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	if !ensureTenantOwnership(c, uint(tenantID)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized to access this tenant"})
		return
	}

	var item models.Item
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item.TenantID = uint(tenantID)

	if result := database.DB.Create(&item); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item"})
		return
	}

	c.JSON(http.StatusCreated, item)
}

// GetItems returns all saved items belonging to a specific tenant
func GetItems(c *gin.Context) {
	tenantIDRaw := c.Param("tenantId")
	tenantID, err := strconv.ParseUint(tenantIDRaw, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	if !ensureTenantOwnership(c, uint(tenantID)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized to access this tenant"})
		return
	}

	var items []models.Item
	if result := database.DB.Where("tenant_id = ?", tenantID).Find(&items); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch items"})
		return
	}

	c.JSON(http.StatusOK, items)
}

// UpdateItem updates an existing item
func UpdateItem(c *gin.Context) {
	tenantIDRaw := c.Param("tenantId")
	itemIDRaw := c.Param("id")

	tenantID, _ := strconv.ParseUint(tenantIDRaw, 10, 32)

	if !ensureTenantOwnership(c, uint(tenantID)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized to access this tenant"})
		return
	}

	var existingItem models.Item
	if err := database.DB.Where("id = ? AND tenant_id = ?", itemIDRaw, tenantID).First(&existingItem).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}

	var input models.Item
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Model(&existingItem).Updates(models.Item{
		Particulars: input.Particulars,
		HSNSAC:      input.HSNSAC,
		Rate:        input.Rate,
		GSTRate:     input.GSTRate,
		Per:         input.Per,
	})

	c.JSON(http.StatusOK, existingItem)
}
