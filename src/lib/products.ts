import { z } from "zod";

export const CATEGORIES = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches",
] as const;

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า"),
  thumbnail: z.string().url("URL รูปภาพไม่ถูกต้อง"),
  images: z.array(z.string().url()),
  price: z.number().min(0, "ราคาต้องไม่ติดลบ"),
  stock: z
    .number()
    .int("จำนวนคงเหลือต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนคงเหลือต้องไม่ติดลบ"),
  category: z.enum(CATEGORIES),
  description: z.string().trim().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export type ProductList = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export const ProductDraftSchema = ProductSchema.omit({
  id: true,
  thumbnail: true,
  images: true,
});

export type ProductDraft = z.infer<typeof ProductDraftSchema>;

export const SORT_FIELDS = [
  "title",
  "price",
  "stock",
] as const;

export type SearchQuery = {
  q: string;
  limit: number;
  sortBy: (typeof SORT_FIELDS)[number];
};

export const defaultQuery: SearchQuery = {
  q: "",
  limit: 10,
  sortBy: "title",
};

const API_BASE = "https://dummyjson.com";

export function buildProductUrl(
  query: SearchQuery,
) {
  const params = new URLSearchParams();

  params.set("limit", String(query.limit));
  params.set("sortBy", query.sortBy);
  params.set("order", "asc");

  params.set(
    "select",
    "id,title,price,stock,category,thumbnail,images,description",
  );

  if (query.q.trim()) {
    params.set("q", query.q.trim());

    return `${API_BASE}/products/search?${params.toString()}`;
  }

  return `${API_BASE}/products?${params.toString()}`;
}

export async function fetchProducts(
  query: SearchQuery,
): Promise<ProductList> {
  const response = await fetch(
    buildProductUrl(query),
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `เรียกข้อมูลไม่สำเร็จ สถานะ ${response.status}`,
    );
  }

  const data = await response.json();

  const parsed = z
    .object({
      products: z.array(ProductSchema),
      total: z.number(),
      skip: z.number(),
      limit: z.number(),
    })
    .safeParse(data);

  if (!parsed.success) {
    throw new Error(
      "ข้อมูลจาก DummyJSON ไม่ตรงตามรูปแบบ",
    );
  }

  return parsed.data;
}