"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { defaultQuery, fetchProducts } from "../../lib/products";

import type { Product, SearchQuery } from "../../lib/products";

import ProductSearchForm from "./ProductSearchForm";
import { AuthButtons } from "./auth-buttons";

const STORAGE_KEY = "dummyjson-products";

type LoadState = "loading" | "ready" | "error";

type ProductExplorerProps = {
  isLoggedIn: boolean;
  userName?: string | null;
};

/*
 * เรียงลำดับและตัดจำนวนตามตัวกรอง (ใช้กับข้อมูลใน localStorage)
 */
function applyQuery(all: Product[], query: SearchQuery): Product[] {
  const sorted = [...all].sort((a, b) =>
    query.sortBy === "title"
      ? a.title.localeCompare(b.title)
      : a[query.sortBy] - b[query.sortBy],
  );

  return sorted.slice(0, query.limit);
}

export default function ProductExplorer({
  isLoggedIn,
  userName,
}: ProductExplorerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // กันผลลัพธ์ของคำค้นเก่าที่ตอบกลับช้ามาเขียนทับคำค้นใหม่
  const requestId = useRef(0);

  async function loadProducts(
    query: SearchQuery = defaultQuery,
    forceDummyJson = false,
  ) {
    const id = ++requestId.current;

    setStatus("loading");
    setErrorMessage("");

    try {
      /*
       * ไม่ได้ค้นหา: ใช้รายการเต็มจาก localStorage
       * แล้วเรียง + ตัดจำนวนตามตัวกรองในหน้าเว็บ
       */
      if (query.q.trim() === "") {
        let all: Product[] | null = null;

        if (!forceDummyJson) {
          const saved = localStorage.getItem(STORAGE_KEY);

          if (saved) {
            try {
              const parsed = JSON.parse(saved);

              if (Array.isArray(parsed)) {
                all = parsed as Product[];
              }
            } catch {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        }

        // ยังไม่มีข้อมูล: โหลดสินค้าทั้งหมดจาก DummyJSON (limit=0 คือทั้งหมด)
        if (!all) {
          const result = await fetchProducts({ ...query, limit: 0 });

          all = result.products;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        }

        if (id !== requestId.current) return;

        setProducts(applyQuery(all, query));
        setStatus("ready");
        return;
      }

      /*
       * มีคำค้น: ค้นจาก DummyJSON ตามตัวกรอง
       */
      const result = await fetchProducts(query);

      if (id !== requestId.current) return;

      setProducts(result.products);
      setStatus("ready");
    } catch (error) {
      if (id !== requestId.current) return;

      setErrorMessage(
        error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ",
      );

      setStatus("error");
    }
  }

  /*
   * โหลดข้อมูลครั้งแรก
   */
  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * รีเซ็ตกลับไปใช้ DummyJSON
   */
  async function resetDummyJson() {
    const confirmed = window.confirm(
      "ต้องการรีเซ็ตข้อมูลกลับเป็น DummyJSON หรือไม่?",
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);

    await loadProducts(defaultQuery, true);
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">รายการสินค้า</h1>

          <p className="text-gray-500 text-sm mt-1">
            DummyJSON + localStorage
          </p>
        </div>

        {/* OAuth */}
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-gray-600">สวัสดี {userName}</span>
          )}

          <AuthButtons
            isLoggedIn={isLoggedIn}
            userName={userName ?? undefined}
          />
        </div>
      </header>

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-wrap gap-2">
        {/* เพิ่มสินค้า */}
        {isLoggedIn && (
          <Link
            href="/products/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            + เพิ่มสินค้า
          </Link>
        )}

        {/* รีเซ็ต */}
        <button
          type="button"
          onClick={resetDummyJson}
          disabled={status === "loading"}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          รีเซ็ต DummyJSON
        </button>
      </div>

      {/* ================= SEARCH ================= */}
      <ProductSearchForm onSearch={(query) => loadProducts(query)} />

      {/* ================= LOADING ================= */}
      {status === "loading" && (
        <div className="border rounded p-6 text-center">
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* ================= ERROR ================= */}
      {status === "error" && (
        <div
          role="alert"
          className="border border-red-300 bg-red-50 text-red-600 rounded p-4"
        >
          {errorMessage}
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {status === "ready" && products.length === 0 && (
        <div className="border rounded p-6 text-center">
          <p className="text-gray-500">ไม่พบสินค้า</p>

          {isLoggedIn && (
            <Link
              href="/products/new"
              className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded"
            >
              + เพิ่มสินค้า
            </Link>
          )}
        </div>
      )}

      {/* ================= PRODUCT TABLE ================= */}
      {status === "ready" && products.length > 0 && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b p-3 text-left">รูปภาพ</th>
                <th className="border-b p-3 text-left">ชื่อสินค้า</th>
                <th className="border-b p-3 text-left">ราคา</th>
                <th className="border-b p-3 text-left">จำนวน</th>
                <th className="border-b p-3 text-left">หมวดหมู่</th>

                {isLoggedIn && (
                  <th className="border-b p-3 text-left">จัดการ</th>
                )}
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  {/* รูป */}
                  <td className="border-b p-3">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>

                  {/* ชื่อ */}
                  <td className="border-b p-3">
                    <div className="font-medium">{product.title}</div>

                    {product.description && (
                      <p className="text-sm text-gray-500 mt-1 max-w-xs">
                        {product.description}
                      </p>
                    )}
                  </td>

                  {/* ราคา */}
                  <td className="border-b p-3 whitespace-nowrap">
                    ฿
                    {product.price.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* จำนวน */}
                  <td className="border-b p-3">{product.stock}</td>

                  {/* หมวดหมู่ */}
                  <td className="border-b p-3">
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-sm">
                      {product.category}
                    </span>
                  </td>

                  {/* จัดการ */}
                  {isLoggedIn && (
                    <td className="border-b p-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          แก้ไข
                        </Link>

                        <Link
                          href={`/products/${product.id}/delete`}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          ลบ
                        </Link>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= COUNT ================= */}
      {status === "ready" && products.length > 0 && (
        <p className="text-sm text-gray-500">
          พบทั้งหมด {products.length} รายการ
        </p>
      )}
    </main>
  );
}