// Shopify Storefront API Types

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  vendor: string
  productType: string
  tags: string[]
  priceRange: {
    minVariantPrice: ShopifyMoney
    maxVariantPrice: ShopifyMoney
  }
  images: {
    edges: Array<{
      node: ShopifyImage
    }>
  }
  variants: {
    edges: Array<{
      node: ShopifyProductVariant
    }>
  }
  featuredImage: ShopifyImage | null
}

export interface ShopifyProductVariant {
  id: string
  title: string
  sku: string
  availableForSale: boolean
  price: ShopifyMoney
  compareAtPrice: ShopifyMoney | null
  selectedOptions: Array<{
    name: string
    value: string
  }>
  image: ShopifyImage | null
}

export interface ShopifyImage {
  url: string
  altText: string | null
  width: number
  height: number
}

export interface ShopifyMoney {
  amount: string
  currencyCode: string
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: ShopifyMoney
    totalAmount: ShopifyMoney
    totalTaxAmount: ShopifyMoney
  }
  lines: {
    edges: Array<{
      node: ShopifyCartLine
    }>
  }
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    product: {
      title: string
      handle: string
      featuredImage: ShopifyImage | null
    }
    price: ShopifyMoney
  }
}

// Webhook payload types
export interface ShopifyOrderWebhook {
  id: number
  admin_graphql_api_id: string
  order_number: number
  name: string
  email: string
  created_at: string
  updated_at: string
  financial_status: string
  fulfillment_status: string | null
  currency: string
  total_price: string
  subtotal_price: string
  total_tax: string
  total_discounts: string
  line_items: ShopifyOrderLineItem[]
  shipping_address: ShopifyAddress | null
  billing_address: ShopifyAddress | null
  customer: ShopifyCustomer | null
}

export interface ShopifyOrderLineItem {
  id: number
  variant_id: number
  product_id: number
  title: string
  quantity: number
  sku: string
  price: string
  total_discount: string
}

export interface ShopifyAddress {
  first_name: string
  last_name: string
  address1: string
  address2: string | null
  city: string
  province: string
  province_code: string
  country: string
  country_code: string
  zip: string
  phone: string | null
}

export interface ShopifyCustomer {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string | null
}

export interface ShopifyInventoryWebhook {
  inventory_item_id: number
  location_id: number
  available: number
  updated_at: string
}

export interface ShopifyFulfillmentWebhook {
  id: number
  order_id: number
  status: string
  tracking_number: string | null
  tracking_url: string | null
  tracking_company: string | null
  line_items: ShopifyOrderLineItem[]
}
