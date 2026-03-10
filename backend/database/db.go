package database

import (
	"log"

	"github.com/glebarez/sqlite"
	"github.com/rohitkokkul/gst-invoice-backend/models"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Connect connects to the SQLite database and migrates the schema.
func Connect() {
	var err error
	DB, err = gorm.Open(sqlite.Open("gst_invoice.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connection established")

	// Migrate the schema
	err = DB.AutoMigrate(
		&models.User{},
		&models.Tenant{},
		&models.Client{},
		&models.Item{},
		&models.Invoice{},
		&models.InvoiceItem{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migration completed")
}
