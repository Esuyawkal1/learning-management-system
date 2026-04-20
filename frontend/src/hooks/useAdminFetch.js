// src/hooks/useAdminFetch.js
"use client";
import { useState, useEffect } from "react";

export const useAdminFetch = (fetcher) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher().then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, [fetcher]);

  return { data, loading };
};