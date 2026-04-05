export const normalizationFieldAliases = {
  supplierSku: ["supplier_sku", "supplierSku", "sku", "id"],
  internalSku: ["internal_sku", "internalSku"],
  ean: ["ean", "gtin", "barcode"],
  brand: ["brand", "manufacturer", "producer"],
  title: ["title", "name", "product_name", "productName"],
  description: ["description", "desc", "product_description", "productDescription"],
  category: ["category", "category_name", "categoryName", "category_path", "categoryPath"],
  weightKg: ["weight_kg", "weightKg"],
  shippingTimeDays: ["shipping_time_days", "shippingTimeDays", "dispatch_days", "lead_time_days"],
  costNet: ["cost_net", "costNet", "price_net", "wholesale_price_net"],
  costGross: ["cost_gross", "costGross", "price_gross", "wholesale_price_gross", "price"],
  currency: ["currency", "currency_code", "currencyCode"],
  stockQuantity: ["stock_quantity", "stockQuantity", "stock", "qty", "quantity"],
  images: ["images", "image_urls", "imageUrls", "photos"],
  attributes: ["attributes", "specifications", "params", "parameters"]
} as const;

export const reservedNormalizationKeys = new Set<string>([
  ...normalizationFieldAliases.supplierSku,
  ...normalizationFieldAliases.internalSku,
  ...normalizationFieldAliases.ean,
  ...normalizationFieldAliases.brand,
  ...normalizationFieldAliases.title,
  ...normalizationFieldAliases.description,
  ...normalizationFieldAliases.category,
  ...normalizationFieldAliases.weightKg,
  ...normalizationFieldAliases.shippingTimeDays,
  ...normalizationFieldAliases.costNet,
  ...normalizationFieldAliases.costGross,
  ...normalizationFieldAliases.currency,
  ...normalizationFieldAliases.stockQuantity,
  ...normalizationFieldAliases.images,
  ...normalizationFieldAliases.attributes,
  "source_product_reference",
  "sourceProductReference"
]);
