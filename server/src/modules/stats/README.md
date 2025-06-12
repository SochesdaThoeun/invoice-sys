# Stats API

The Stats API provides dashboard analytics for sellers to track their business performance over time.

## Endpoints

### GET /api/stats/monthly

Returns monthly statistics for the last 4 months for the authenticated seller.

**Authentication Required**: Yes (Bearer token)

**Response Format**:
```json
{
  "months": [
    {
      "month": "October 2024",
      "totalRevenue": 15000.50,
      "totalCustomers": 25,
      "totalInvoices": 45,
      "totalProductsSold": 120
    },
    {
      "month": "November 2024", 
      "totalRevenue": 18500.75,
      "totalCustomers": 30,
      "totalInvoices": 52,
      "totalProductsSold": 145
    },
    {
      "month": "December 2024",
      "totalRevenue": 22000.00,
      "totalCustomers": 35,
      "totalInvoices": 58,
      "totalProductsSold": 165
    },
    {
      "month": "January 2025",
      "totalRevenue": 19500.25,
      "totalCustomers": 32,
      "totalInvoices": 55,
      "totalProductsSold": 150
    }
  ]
}
```

**Metrics Explanation**:
- **totalRevenue**: Sum of all issued/paid invoice amounts for the month
- **totalCustomers**: Count of new customers created in the month
- **totalInvoices**: Count of all invoices created in the month (regardless of status)
- **totalProductsSold**: Sum of quantities from all order cart items in the month

**Data Scope**: All data is automatically filtered by the authenticated seller's ID to ensure proper tenant isolation.

**Example Usage**:
```bash
curl -X GET "http://localhost:3000/api/stats/monthly" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
``` 