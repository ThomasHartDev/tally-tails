import type {Storefront} from '@shopify/hydrogen';
import {PRODUCTS, type Product, type Category, findProduct} from '~/data/products';

/**
 * Storefront API access. Real GraphQL when PUBLIC_STORE_DOMAIN is a real
 * Shopify store, static fallback when it's empty or mock.shop. The fallback
 * keeps the placeholder catalog rendering before the Headless channel is
 * installed on the TallyTails Shopify store.
 */

function isShopifyLive(domain: string | undefined): boolean {
  return Boolean(domain && domain !== 'mock.shop');
}

const PRODUCT_FIELDS = `#graphql
  fragment ProductFields on Product {
    handle
    title
    vendor
    productType
    description
    tags
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    images(first: 4) {
      nodes { url altText }
    }
    variants(first: 1) {
      nodes { id }
    }
  }
` as const;

const PRODUCTS_QUERY = `#graphql
  ${PRODUCT_FIELDS}
  query Products {
    products(first: 50) { nodes { ...ProductFields } }
  }
` as const;

const PRODUCT_QUERY = `#graphql
  ${PRODUCT_FIELDS}
  query Product($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
` as const;

function deriveCategory(tags: string[]): Category {
  // Tags from the seeded catalog look like ["side:cat", "bed", "hero"] or
  // ["side:dog", "harness"] or ["bundle"]. Accept the prefixed side tags as
  // the canonical signal and fall back to bare "cat"/"dog" for forward-compat
  // with future supplier imports that may not use the side: prefix.
  if (tags.includes('side:dog') || tags.includes('dog')) return 'dog';
  if (tags.includes('side:cat') || tags.includes('cat')) return 'cat';
  if (tags.includes('bundle') || tags.includes('bundles')) return 'bundles';
  return 'cat';
}

function normalizeProduct(node: any): Product {
  const tags: string[] = node.tags || [];
  const price = node.priceRange.minVariantPrice;
  // Shopify returns "0.0" instead of null when a product has no compare-at
  // price set. Only treat it as a real sale when it's strictly above price.
  const rawCompare = node.compareAtPriceRange?.minVariantPrice;
  const compareAtPrice =
    rawCompare && parseFloat(rawCompare.amount) > parseFloat(price.amount)
      ? rawCompare
      : undefined;
  return {
    handle: node.handle,
    title: node.title,
    vendor: node.vendor,
    category: deriveCategory(tags),
    productType: node.productType ?? '',
    description: node.description,
    tags,
    featured: tags.includes('featured'),
    onSale: Boolean(compareAtPrice),
    price,
    compareAtPrice,
    images: (node.images?.nodes || []).map((img: any) => ({
      url: img.url,
      alt: img.altText ?? '',
    })),
    variantId: node.variants?.nodes?.[0]?.id ?? undefined,
  };
}

export async function listProducts(
  storefront: Storefront,
  domain: string | undefined,
): Promise<Product[]> {
  if (!isShopifyLive(domain)) return PRODUCTS;
  const data = await storefront.query<{products: {nodes: any[]}}>(PRODUCTS_QUERY);
  return data.products.nodes.map(normalizeProduct);
}

export async function getProduct(
  storefront: Storefront,
  domain: string | undefined,
  handle: string,
): Promise<Product | null> {
  if (!isShopifyLive(domain)) return findProduct(handle) ?? null;
  const data = await storefront.query<{product: any | null}>(PRODUCT_QUERY, {
    variables: {handle},
  });
  return data.product ? normalizeProduct(data.product) : null;
}

// Cart handoff. Builds a cart on Shopify and returns its hosted
// checkoutUrl so the browser can redirect to the real Shopify checkout.

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
` as const;

type CartCreateInput = {
  lines: Array<{merchandiseId: string; quantity: number}>;
  discountCodes?: string[];
};

type CartCreateResult = {
  cart: {id: string; checkoutUrl: string} | null;
  userErrors: Array<{field?: string[]; message: string}>;
};

export async function createShopifyCart(
  storefront: Storefront,
  input: CartCreateInput,
): Promise<CartCreateResult> {
  const data = await storefront.mutate<{cartCreate: CartCreateResult}>(
    CART_CREATE_MUTATION,
    {variables: {input}},
  );
  return data.cartCreate;
}
