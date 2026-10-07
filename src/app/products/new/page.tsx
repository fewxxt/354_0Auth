"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import ProductForm from "@/app/components/ProductForm";

import type {
  Product,
  ProductDraft,
} from "@/lib/products";

const STORAGE_KEY = "dummyjson-products";

const DEFAULT_THUMBNAIL =
  "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png";

const DEFAULT_IMAGES = [
  "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png",
];

export default function NewProductPage() {
  const router = useRouter();

  function createProduct(
    values: ProductDraft,
  ) {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    let products: Product[] = [];

    if (saved) {
      try {
        products =
          JSON.parse(saved) as Product[];
      } catch {
        products = [];
      }
    }

    /*
     * หา ID ใหม่จาก ID ที่มีอยู่
     * เช่น 1, 2, 3 → สินค้าใหม่เป็น 4
     */
    const newId =
      products.length > 0
        ? Math.max(
            ...products.map(
              (product) => product.id,
            ),
          ) + 1
        : 1;

    const newProduct: Product = {
      id: newId,

      title: values.title,

      price: values.price,

      stock: values.stock,

      category: values.category,

      description:
        values.description ?? "",

      thumbnail:
        DEFAULT_THUMBNAIL,

      images: DEFAULT_IMAGES,
    };

    const updatedProducts = [
      ...products,
      newProduct,
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedProducts),
    );

    router.push("/");
    router.refresh();
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          เพิ่มสินค้าใหม่
        </h1>

        <Link
          href="/"
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          กลับหน้าแรก
        </Link>
      </div>

      <section className="border rounded-lg p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <ProductCreateForm
            onSave={createProduct}
            onCancel={() => router.push("/")}
          />
        </form>
      </section>
    </main>
  );
}

/*
 * Form สำหรับเพิ่มสินค้า
 * แยกจาก ProductForm เพราะ ProductForm
 * ถูกออกแบบมาสำหรับ "แก้ไข"
 */
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  CATEGORIES,
  ProductDraftSchema,
} from "@/lib/products";

function ProductCreateForm({
  onSave,
  onCancel,
}: {
  onSave: (
    values: ProductDraft,
  ) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isDirty,
      isValid,
    },
  } = useForm<ProductDraft>({
    resolver:
      zodResolver(ProductDraftSchema),

    mode: "onTouched",

    defaultValues: {
      title: "",
      price: 0,
      stock: 0,
      category: CATEGORIES[0],
      description: "",
    },
  });

  const submit: SubmitHandler<
    ProductDraft
  > = (values) => {
    onSave(values);
  };

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="title"
          className="block font-medium mb-1"
        >
          ชื่อสินค้า
        </label>

        <input
          id="title"
          {...register("title")}
          placeholder="กรอกชื่อสินค้า"
          className="border p-2 rounded w-full"
        />

        {errors.title && (
          <p className="text-red-500 text-sm">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="price"
          className="block font-medium mb-1"
        >
          ราคา
        </label>

        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          {...register("price", {
            valueAsNumber: true,
          })}
          className="border p-2 rounded w-full"
        />

        {errors.price && (
          <p className="text-red-500 text-sm">
            {errors.price.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="stock"
          className="block font-medium mb-1"
        >
          จำนวนคงเหลือ
        </label>

        <input
          id="stock"
          type="number"
          min="0"
          step="1"
          {...register("stock", {
            valueAsNumber: true,
          })}
          className="border p-2 rounded w-full"
        />

        {errors.stock && (
          <p className="text-red-500 text-sm">
            {errors.stock.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category"
          className="block font-medium mb-1"
        >
          หมวดหมู่
        </label>

        <select
          id="category"
          {...register("category")}
          className="border p-2 rounded w-full"
        >
          {CATEGORIES.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ),
          )}
        </select>

        {errors.category && (
          <p className="text-red-500 text-sm">
            {errors.category.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block font-medium mb-1"
        >
          รายละเอียด
        </label>

        <textarea
          id="description"
          rows={4}
          {...register("description")}
          placeholder="รายละเอียดสินค้า"
          className="border p-2 rounded w-full"
        />

        {errors.description && (
          <p className="text-red-500 text-sm">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit(submit)}
          disabled={!isDirty || !isValid}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          เพิ่มสินค้า
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
