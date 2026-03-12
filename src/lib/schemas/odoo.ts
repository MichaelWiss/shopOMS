import { z } from 'zod'

// Odoo returns `false` instead of null/undefined for empty fields
const odooString = z.union([z.string(), z.literal(false)])

// Odoo returns relation fields as a number, [id, name] tuple, or false
const OdooRelationField = z.union([z.number(), z.tuple([z.number(), z.string()]), z.literal(false)])

export const OdooPartnerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: odooString,
  phone: odooString.optional(),
  street: odooString.optional(),
  street2: odooString.optional(),
  city: odooString.optional(),
  state_id: OdooRelationField.optional(),
  country_id: OdooRelationField.optional(),
  zip: odooString.optional(),
  customer_rank: z.number().optional(),
  shopify_customer_id: odooString.optional(),
})

export const OdooProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  default_code: odooString.optional(),
  list_price: z.number().optional(),
  standard_price: z.number().optional(),
  qty_available: z.number().optional(),
  virtual_available: z.number().optional(),
  type: z.enum(['consu', 'service', 'product']).optional(),
  active: z.boolean().optional(),
  shopify_product_id: odooString.optional(),
  shopify_variant_id: odooString.optional(),
})

export const OdooSaleOrderSchema = z.object({
  id: z.number(),
  name: odooString.optional(),
  partner_id: OdooRelationField,
  state: z.enum(['draft', 'sent', 'sale', 'done', 'cancel']),
  date_order: odooString.optional(),
  amount_total: z.number().optional(),
  amount_untaxed: z.number().optional(),
  amount_tax: z.number().optional(),
  shopify_order_id: odooString.optional(),
  shopify_order_number: odooString.optional(),
})

export type ValidatedOdooPartner = z.infer<typeof OdooPartnerSchema>
export type ValidatedOdooProduct = z.infer<typeof OdooProductSchema>
export type ValidatedOdooSaleOrder = z.infer<typeof OdooSaleOrderSchema>
