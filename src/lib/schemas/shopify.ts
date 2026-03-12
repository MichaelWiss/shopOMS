import { z } from 'zod'

// --- Shared sub-schemas ---

const AddressSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  address1: z.string(),
  address2: z.string().nullable(),
  city: z.string(),
  province: z.string(),
  province_code: z.string(),
  country: z.string(),
  country_code: z.string(),
  zip: z.string(),
  phone: z.string().nullable(),
})

const CustomerSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable(),
})

const LineItemPropertySchema = z.object({
  name: z.string(),
  value: z.string(),
})

const OrderLineItemSchema = z.object({
  id: z.number(),
  variant_id: z.number(),
  product_id: z.number(),
  title: z.string(),
  quantity: z.number().int().min(1),
  sku: z.string(),
  price: z.string(),
  total_discount: z.string(),
  properties: z.array(LineItemPropertySchema),
})

// --- Webhook payload schemas ---

export const ShopifyOrderWebhookSchema = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  order_number: z.number(),
  name: z.string(),
  email: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  financial_status: z.string(),
  fulfillment_status: z.string().nullable(),
  currency: z.string(),
  total_price: z.string(),
  subtotal_price: z.string(),
  total_tax: z.string(),
  total_discounts: z.string(),
  line_items: z.array(OrderLineItemSchema).min(1),
  shipping_address: AddressSchema.nullable(),
  billing_address: AddressSchema.nullable(),
  customer: CustomerSchema.nullable(),
})

export const ShopifyInventoryWebhookSchema = z.object({
  inventory_item_id: z.number(),
  location_id: z.number(),
  available: z.number().optional(),
  sku: z.string().optional(),
  updated_at: z.string().optional(),
})

export const ShopifyFulfillmentWebhookSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  status: z.string(),
  tracking_number: z.string().nullable(),
  tracking_url: z.string().nullable(),
  tracking_company: z.string().nullable(),
  line_items: z.array(OrderLineItemSchema),
})

// Inferred types match the existing interfaces
export type ValidatedShopifyOrder = z.infer<typeof ShopifyOrderWebhookSchema>
export type ValidatedShopifyInventory = z.infer<typeof ShopifyInventoryWebhookSchema>
export type ValidatedShopifyFulfillment = z.infer<typeof ShopifyFulfillmentWebhookSchema>
