"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
useParams,
useRouter,
} from "next/navigation";

import type { Product } from "@/lib/products";

const STORAGE_KEY =
"dummyjson-products";

export default function DeleteProductPage() {
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
    "ไม่พบข้อมูลสินค้า",
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

function deleteProduct() {
if (!product) {
return;
}

const saved =
  localStorage.getItem(STORAGE_KEY);

if (!saved) {
  setError(
    "ไม่พบข้อมูลสินค้า",
  );
  return;
}

try {
  const products =
    JSON.parse(saved) as Product[];

  const updated =
    products.filter(
      (item) =>
        item.id !== product.id,
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated),
  );

  router.push("/");
  router.refresh();
} catch {
  setError(
    "ไม่สามารถลบสินค้าได้",
  );
}


}

if (loading) {
return (
<main className="max-w-2xl mx-auto p-6">
<p>กำลังโหลด...</p>
</main>
);
}

if (error || !product) {
return (
<main className="max-w-2xl mx-auto p-6 space-y-4">
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
<main className="max-w-2xl mx-auto p-6">
<div className="border rounded-lg p-6 space-y-5">
<h1 className="text-2xl font-bold">
ยืนยันการลบสินค้า
</h1>

    <div className="flex gap-4 items-center">
      <img
        src={product.thumbnail}
        alt={product.title}
        className="w-24 h-24 object-cover rounded"
      />

      <div>
        <h2 className="font-bold text-lg">
          {product.title}
        </h2>

        <p>
          ราคา ฿
          {product.price.toLocaleString(
            "th-TH",
          )}
        </p>

        <p className="text-gray-500">
          {product.category}
        </p>
      </div>
    </div>

    <p className="text-red-600">
      คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า
      นี้?
    </p>

    <div className="flex gap-2">
      <button
        type="button"
        onClick={deleteProduct}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        ยืนยันการลบ
      </button>

      <Link
        href="/"
        className="bg-gray-400 text-white px-4 py-2 rounded"
      >
        ยกเลิก
      </Link>
    </div>
  </div>
</main>


);
}