package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rohitkokkul/gst-invoice-backend/database"
	"github.com/rohitkokkul/gst-invoice-backend/models"
)

// CreateInvoice generates a new tax invoice with its line items
func CreateInvoice(c *gin.Context) {
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

	var payload struct {
		ClientID       uint                 `json:"client_id" binding:"required"`
		InvoiceNo      string               `json:"invoice_no" binding:"required"`
		Date           time.Time            `json:"date" binding:"required"`
		Reference      string               `json:"reference"`
		OtherReference string               `json:"other_reference"`
		Remarks        string               `json:"remarks"`
		LineItems      []models.InvoiceItem `json:"line_items" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calculate totals based on line items to ensure data integrity
	var totalAmount, totalTax float64
	for i := range payload.LineItems {
		item := &payload.LineItems[i]

		// If amount is not provided by frontend, calculate it
		if item.Amount == 0 {
			item.Amount = item.Quantity * item.Rate
		}

		taxAmount := item.Amount * (item.GSTRate / 100.0)
		totalAmount += item.Amount
		totalTax += taxAmount
	}

	// Create Invoice object
	invoice := models.Invoice{
		TenantID:       uint(tenantID),
		ClientID:       payload.ClientID,
		InvoiceNo:      payload.InvoiceNo,
		Date:           payload.Date,
		Reference:      payload.Reference,
		OtherReference: payload.OtherReference,
		Remarks:        payload.Remarks,
		TotalAmount:    totalAmount,
		TotalTax:       totalTax,
		LineItems:      payload.LineItems, // GORM will automatically save the children
	}

	if result := database.DB.Create(&invoice); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create invoice: %v", result.Error)})
		return
	}

	c.JSON(http.StatusCreated, invoice)
}

// GetInvoices fetches all invoices for a tenant
func GetInvoices(c *gin.Context) {
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

	var invoices []models.Invoice
	// Preload LineItems to get the full view
	if result := database.DB.Preload("LineItems").Where("tenant_id = ?", tenantID).Find(&invoices); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch invoices"})
		return
	}

	c.JSON(http.StatusOK, invoices)
}

// GetInvoice retrieves a single invoice by ID
func GetInvoice(c *gin.Context) {
	tenantIDRaw := c.Param("tenantId")
	invoiceIDRaw := c.Param("id")

	tenantID, _ := strconv.ParseUint(tenantIDRaw, 10, 32)

	if !ensureTenantOwnership(c, uint(tenantID)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized to access this tenant"})
		return
	}

	var invoice models.Invoice
	if err := database.DB.Preload("LineItems").Where("id = ? AND tenant_id = ?", invoiceIDRaw, tenantID).First(&invoice).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
		return
	}

	c.JSON(http.StatusOK, invoice)
}
