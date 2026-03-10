package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rohitkokkul/gst-invoice-backend/database"
	"github.com/rohitkokkul/gst-invoice-backend/models"
)

// ensureTenantOwnership checks if the logged-in user owns the given tenantID
func ensureTenantOwnership(c *gin.Context, tenantID uint) bool {
	userIDRaw, _ := c.Get("userID")
	userID := uint(userIDRaw.(float64))

	var count int64
	database.DB.Model(&models.Tenant{}).Where("id = ? AND user_id = ?", tenantID, userID).Count(&count)
	return count > 0
}

// CreateClient creates a new buyer under a specific tenant
func CreateClient(c *gin.Context) {
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

	var client models.Client
	if err := c.ShouldBindJSON(&client); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	client.TenantID = uint(tenantID)

	if result := database.DB.Create(&client); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create client"})
		return
	}

	c.JSON(http.StatusCreated, client)
}

// GetClients returns all buyers belonging to a specific tenant
func GetClients(c *gin.Context) {
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

	var clients []models.Client
	if result := database.DB.Where("tenant_id = ?", tenantID).Find(&clients); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch clients"})
		return
	}

	c.JSON(http.StatusOK, clients)
}

// UpdateClient updates an existing buyer
func UpdateClient(c *gin.Context) {
	tenantIDRaw := c.Param("tenantId")
	clientIDRaw := c.Param("id")

	tenantID, _ := strconv.ParseUint(tenantIDRaw, 10, 32)
	
	if !ensureTenantOwnership(c, uint(tenantID)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized to access this tenant"})
		return
	}

	var existingClient models.Client
	if err := database.DB.Where("id = ? AND tenant_id = ?", clientIDRaw, tenantID).First(&existingClient).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
		return
	}

	var input models.Client
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Model(&existingClient).Updates(models.Client{
		BuyerName: input.BuyerName,
		Address:   input.Address,
		GSTIN:     input.GSTIN,
		StateName: input.StateName,
		StateCode: input.StateCode,
	})

	c.JSON(http.StatusOK, existingClient)
}
