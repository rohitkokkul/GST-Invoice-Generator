package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rohitkokkul/gst-invoice-backend/database"
	"github.com/rohitkokkul/gst-invoice-backend/models"
)

// CreateTenant creates a new company profile for the logged-in user
func CreateTenant(c *gin.Context) {
	// Extract userID from JWT middleware
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// userID comes as float64 from JWT map claims
	userID := uint(userIDRaw.(float64))

	var tenant models.Tenant
	if err := c.ShouldBindJSON(&tenant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenant.UserID = userID

	if result := database.DB.Create(&tenant); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tenant"})
		return
	}

	c.JSON(http.StatusCreated, tenant)
}

// GetTenants returns all company profiles belonging to the user
func GetTenants(c *gin.Context) {
	userIDRaw, _ := c.Get("userID")
	userID := uint(userIDRaw.(float64))

	var tenants []models.Tenant
	if result := database.DB.Where("user_id = ?", userID).Find(&tenants); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tenants"})
		return
	}

	c.JSON(http.StatusOK, tenants)
}

// UpdateTenant updates existing company details
func UpdateTenant(c *gin.Context) {
	tenantID := c.Param("id")
	userIDRaw, _ := c.Get("userID")
	userID := uint(userIDRaw.(float64))

	var existingTenant models.Tenant
	if err := database.DB.Where("id = ? AND user_id = ?", tenantID, userID).First(&existingTenant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found or unauthorized"})
		return
	}

	var input models.Tenant
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update only allowed fields
	database.DB.Model(&existingTenant).Updates(models.Tenant{
		CompanyName: input.CompanyName,
		GSTIN:       input.GSTIN,
		Address:     input.Address,
		StateName:   input.StateName,
		StateCode:   input.StateCode,
		Contact:     input.Contact,
		Email:       input.Email,
		BankName:    input.BankName,
		BankAcc:     input.BankAcc,
		BankIFSC:    input.BankIFSC,
	})

	c.JSON(http.StatusOK, existingTenant)
}
