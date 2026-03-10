package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/rohitkokkul/gst-invoice-backend/controllers"
	"github.com/rohitkokkul/gst-invoice-backend/database"
	"github.com/rohitkokkul/gst-invoice-backend/middleware"
)

// CORSMiddleware setup
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // In production, narrow this
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	// Initialize Database
	database.Connect()

	// Initialize Gin router
	r := gin.Default()
	r.Use(CORSMiddleware())

	// Simple health check route
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "GST Invoice Backend API is up and running!",
		})
	})

	// Public Auth Routes
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}

	// Protected Routes
	api := r.Group("/api")
	api.Use(middleware.RequireAuth)
	{
		// Tenants (Companies)
		api.POST("/tenants", controllers.CreateTenant)
		api.GET("/tenants", controllers.GetTenants)
		// Change :id to :tenantId to avoid conflicts with nested routes at the same level
		api.PUT("/tenants/:tenantId", controllers.UpdateTenant)

		// Clients (nested under tenant)
		api.POST("/tenants/:tenantId/clients", controllers.CreateClient)
		api.GET("/tenants/:tenantId/clients", controllers.GetClients)
		api.PUT("/tenants/:tenantId/clients/:id", controllers.UpdateClient)

		// Items (nested under tenant)
		api.POST("/tenants/:tenantId/items", controllers.CreateItem)
		api.GET("/tenants/:tenantId/items", controllers.GetItems)
		api.PUT("/tenants/:tenantId/items/:id", controllers.UpdateItem)

		// Invoices (nested under tenant)
		api.POST("/tenants/:tenantId/invoices", controllers.CreateInvoice)
		api.GET("/tenants/:tenantId/invoices", controllers.GetInvoices)
		api.GET("/tenants/:tenantId/invoices/:id", controllers.GetInvoice)
	}

	log.Println("Server running on port 8080")
	r.Run(":8080")
}
