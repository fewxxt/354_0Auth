"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ProductForm from "@/app/components/ProductForm";

import type {
  Product,
  ProductDraft,
} from "@/lib/products";

const STORAGE_KEY = "dummyjson-products";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const id = Number(params.id);

    if (!Number.isFinite(id)) {
      setError("รหัสสินค้าไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      setError(
        "ไม่พบข้อมูลสินค้า กรุณากลับหน้าแรกก่อน",
      );
      setLoading(false);
      return;
    }

    try {
      const products =
        JSON.parse(saved) as Product[];

      const found =
        products.find(
          (item) => item.id === id,
        );

      if (!found) {
        setError("ไม่พบสินค้านี้");
      } else {
        setProduct(found);
      }
    } catch {
      setError(
        "ไม่สามารถอ่านข้อมูลสินค้าได้",
      );
    }

    setLoading(false);
  }, [params.id]);

  function saveProduct(
    values: ProductDraft,
  ) {
    if (!product) {
      return;
    }

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      const products =
        JSON.parse(saved) as Product[];

      const updated =
        products.map((item) =>
          item.id === product.id
            ? {
                ...item,
                ...values,
              }
            : item,
        );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated),
      );

      router.push("/");
      router.refresh();
    } catch {
      setError(
        "ไม่สามารถบันทึกข้อมูลได้",
      );
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p>กำลังโหลด...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <p className="text-red-500">
          {error || "ไม่พบสินค้า"}
        </p>

        <Link
          href="/"
          className="inline-block bg-gray-600 text-white px-4 py-2 rounded"
        >
          กลับหน้าแรก
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <ProductForm
        editing={product}
        onSave={saveProduct}
        onCancel={() => router.push("/")}
      />
    </main>
  );
}
