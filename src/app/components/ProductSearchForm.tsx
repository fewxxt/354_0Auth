"use client";

import { useEffect, useRef, useState } from "react";

import { defaultQuery, SORT_FIELDS } from "../../lib/products";
import type { SearchQuery } from "../../lib/products";

type Props = {
  onSearch: (query: SearchQuery) => void | Promise<void>;
};

export default function ProductSearchForm({ onSearch }: Props) {
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(defaultQuery.limit);
  const [sortBy, setSortBy] = useState<SearchQuery["sortBy"]>(defaultQuery.sortBy);

  // เก็บ onSearch ล่าสุดไว้ใน ref กัน effect วนซ้ำเมื่อหน้าหลักสร้างฟังก์ชันใหม่
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  // ค้นหาอัตโนมัติเมื่อค่าเปลี่ยน (หน่วง 300 ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      void onSearchRef.current({ q, limit, sortBy });
    }, 300);
    return () => clearTimeout(timer);
  }, [q, limit, sortBy]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSearch({ q, limit, sortBy });
  }

  return (
    <form onSubmit={submit}>
      <label>
        ค้นหาสินค้า
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="เช่น phone, laptop"
        />
      </label>

      <label>
        จำนวน
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
      </label>

      <label>
        เรียงตาม
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SearchQuery["sortBy"])}
        >
          {SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </label>

      <button type="submit">ค้นหา</button>
    </form>
  );
}