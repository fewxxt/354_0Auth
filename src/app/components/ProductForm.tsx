"use client";

import { useEffect } from "react";

import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import type {
  Product,
  ProductDraft,
} from "../../lib/products";

import {
  CATEGORIES,
  ProductDraftSchema,
} from "../../lib/products";

type Props = {
  editing: Product;
  onSave: (
    values: ProductDraft,
  ) => void;
  onCancel: () => void;
};

export default function ProductForm({
  editing,
  onSave,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
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

  useEffect(() => {
    reset({
      title: editing.title,
      price: editing.price,
      stock: editing.stock,
      category: editing.category,
      description:
        editing.description ?? "",
    });
  }, [editing, reset]);

  const submit: SubmitHandler<
    ProductDraft
  > = (values) => {
    onSave(values);
  };

  return (
    <section className="border rounded p-6">
      <h1 className="text-xl font-bold mb-4">
        แก้ไขสินค้า
      </h1>

      <form
        onSubmit={handleSubmit(submit)}
        className="space-y-4"
        noValidate
      >
        <div>
          <label
            htmlFor="title"
            className="block mb-1"
          >
            ชื่อสินค้า
          </label>

          <input
            id="title"
            {...register("title")}
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
            className="block mb-1"
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
            className="block mb-1"
          >
            จำนวนคงเหลือ
          </label>

          <input
            id="stock"
            type="number"
            min="0"
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
            className="block mb-1"
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
            className="block mb-1"
          >
            รายละเอียด
          </label>

          <textarea
            id="description"
            rows={4}
            {...register("description")}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={
              !isDirty || !isValid
            }
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            บันทึก
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </section>
  );
}
