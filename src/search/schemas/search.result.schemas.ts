import * as z from 'zod';

export const WalmartProductSchema = z.object({
  itemId: z.number(),
  parentItemId: z.number(),
  name: z.string(),
  salePrice: z.number(),
  upc: z.string(),
  categoryPath: z.string(),
  shortDescription: z.string(),
  longDescription: z.string(),
  brandName: z.string(),
  thumbnailImage: z.string(),
  mediumImage: z.string(),
  largeImage: z.string(),
  productTrackingUrl: z.string(),
  ninetySevenCentShipping: z.boolean(),
  standardShipRate: z.number(),
  color: z.string().optional(),
  marketplace: z.boolean(),
  shipToStore: z.boolean(),
  freeShipToStore: z.boolean(),
  modelNumber: z.string().optional(),
  sellerInfo: z.string(),
  customerRating: z.string().optional(),
  numReviews: z.number().optional(),
  categoryNode: z.string(),
  rhid: z.string().optional(),
  bundle: z.boolean(),
  clearance: z.boolean(),
  preOrder: z.boolean(),
  stock: z.string().optional(),
  freight: z.boolean(),
  attributes: z.record(z.string(), z.any()).optional(),
  affiliateAddToCartUrl: z.string(),
  freeShippingOver35Dollars: z.boolean(),
  maxItemsInOrder: z.number().optional(),
  giftOptions: z.record(z.string(), z.any()).optional(),
  imageEntities: z.array(
    z.object({
      thumbnailImage: z.string(),
      mediumImage: z.string(),
      largeImage: z.string(),
      entityType: z.string(),
    }),
  ),
  offerType: z.string(),
  isTwoDayShippingEligible: z.boolean(),
  availableOnline: z.boolean(),
  offerId: z.string(),
  warnings: z
    .array(
      z.object({
        Attribute: z.string(),
        DisplayName: z.string(),
        Value: z.array(z.string()),
      }),
    )
    .optional(),
  variants: z.array(z.number()).optional(),
  bestMarketplacePrice: z
    .object({
      price: z.number(),
      sellerInfo: z.string(),
      standardShipRate: z.number(),
      twoThreeDayShippingRate: z.number(),
      availableOnline: z.boolean(),
      clearance: z.boolean(),
    })
    .optional(),
  gender: z.string().optional(),
  size: z.string().optional(),
  msrp: z.number().optional(),
});

export const WalmartApiResponseSchema = z.object({
  query: z.string(),
  sort: z.string(),
  responseGroup: z.string(),
  totalResults: z.number(),
  start: z.number(),
  numItems: z.number(),
  items: z.array(WalmartProductSchema),
});
