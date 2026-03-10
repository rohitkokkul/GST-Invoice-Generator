package models

import (
	"time"
)

// User represents the SaaS account owner
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"` // Hashed password, rarely sent to frontend
	Tenants   []Tenant  `gorm:"foreignKey:UserID" json:"tenants,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Tenant represents a Company/Business profile (Multi-tenant design)
type Tenant struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	CompanyName string    `gorm:"not null" json:"company_name"`
	GSTIN       string    `gorm:"not null" json:"gstin"`
	Address     string    `gorm:"type:text;not null" json:"address"`
	StateName   string    `json:"state_name"`
	StateCode   string    `json:"state_code"`
	Contact     string    `json:"contact"`
	Email       string    `json:"email"`
	BankName    string    `json:"bank_name"`
	BankAcc     string    `json:"bank_acc"`
	BankIFSC    string    `json:"bank_ifsc"`
	Clients     []Client  `gorm:"foreignKey:TenantID" json:"clients,omitempty"`
	Items       []Item    `gorm:"foreignKey:TenantID" json:"items,omitempty"`
	Invoices    []Invoice `gorm:"foreignKey:TenantID" json:"invoices,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Client represents a Buyer that belongs to a specific Tenant
type Client struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TenantID  uint      `gorm:"not null;index" json:"tenant_id"`
	BuyerName string    `gorm:"not null" json:"buyer_name"`
	Address   string    `gorm:"type:text;not null" json:"address"`
	GSTIN     string    `json:"gstin"`
	StateName string    `json:"state_name"`
	StateCode string    `json:"state_code"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Item represents a standard Product or Service mapped to a Tenant
type Item struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	TenantID    uint      `gorm:"not null;index" json:"tenant_id"`
	Particulars string    `gorm:"not null" json:"particulars"`
	HSNSAC      string    `json:"hsn_sac"`
	Rate        float64   `gorm:"not null" json:"rate"`
	GSTRate     float64   `gorm:"not null" json:"gst_rate"`
	Per         string    `json:"per"` // e.g., "Nos", "Kg", "Ltr"
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Invoice represents a generated Tax Invoice
type Invoice struct {
	ID             uint          `gorm:"primaryKey" json:"id"`
	TenantID       uint          `gorm:"not null;index" json:"tenant_id"`
	ClientID       uint          `gorm:"not null;index" json:"client_id"`
	InvoiceNo      string        `gorm:"not null;uniqueIndex:idx_tenant_inv" json:"invoice_no"`
	Date           time.Time     `gorm:"not null" json:"date"`
	Reference      string        `json:"reference"`
	OtherReference string        `json:"other_reference"`
	Remarks        string        `gorm:"type:text" json:"remarks"`
	TotalAmount    float64       `gorm:"not null" json:"total_amount"`
	TotalTax       float64       `gorm:"not null" json:"total_tax"`
	LineItems      []InvoiceItem `gorm:"foreignKey:InvoiceID" json:"line_items"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
}

// InvoiceItem represents a single row/item within an Invoice
type InvoiceItem struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	InvoiceID   uint      `gorm:"not null;index;constraint:OnDelete:CASCADE;" json:"invoice_id"`
	ItemID      *uint     `json:"item_id"` // Optional link to standard Item
	Particulars string    `gorm:"not null" json:"particulars"`
	HSNSAC      string    `json:"hsn_sac"`
	Quantity    float64   `gorm:"not null" json:"quantity"`
	Rate        float64   `gorm:"not null" json:"rate"`
	GSTRate     float64   `gorm:"not null" json:"gst_rate"`
	Amount      float64   `gorm:"not null" json:"amount"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
