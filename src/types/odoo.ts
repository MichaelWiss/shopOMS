// Odoo API Types

export interface OdooPartner {
  id?: number
  name: string
  email: string
  phone?: string
  street?: string
  street2?: string
  city?: string
  state_id?: number | [number, string]
  country_id?: number | [number, string]
  zip?: string
  customer_rank?: number
  shopify_customer_id?: string
}

export interface OdooSaleOrder {
  id?: number
  name?: string
  partner_id: number | [number, string]
  partner_invoice_id?: number | [number, string]
  partner_shipping_id?: number | [number, string]
  date_order?: string
  state?: 'draft' | 'sent' | 'sale' | 'done' | 'cancel'
  order_line?: Array<[number, number, OdooSaleOrderLine]>
  shopify_order_id?: string
  shopify_order_number?: string
  amount_total?: number
  amount_tax?: number
  amount_untaxed?: number
}

export interface OdooSaleOrderLine {
  product_id: number | [number, string]
  name: string
  product_uom_qty: number
  price_unit: number
  discount?: number
  tax_id?: Array<[number, number, number[]]>
}

export interface OdooProduct {
  id?: number
  name: string
  default_code?: string  // SKU
  list_price?: number
  standard_price?: number
  qty_available?: number
  virtual_available?: number
  type?: 'consu' | 'service' | 'product'
  shopify_product_id?: string
  shopify_variant_id?: string
}

export interface OdooStockMove {
  id?: number
  product_id: number | [number, string]
  product_uom_qty: number
  location_id: number | [number, string]
  location_dest_id: number | [number, string]
  state?: 'draft' | 'waiting' | 'confirmed' | 'assigned' | 'done' | 'cancel'
}

// Odoo XML-RPC response types
export interface OdooAuthResponse {
  uid: number
}

export interface OdooSearchReadResponse<T> {
  length: number
  records: T[]
}

export type OdooFieldValue = string | number | boolean | null | [number, string] | number[]
