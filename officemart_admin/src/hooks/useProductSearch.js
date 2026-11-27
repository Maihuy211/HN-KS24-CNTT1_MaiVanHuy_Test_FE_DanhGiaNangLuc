import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/axiosClient.js';

export default function useProductSearch({ q = '', category = '', status = '', page = 1, reload = 0 }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/products', {
          params: { q: q.trim(), category, status, page, limit: 10 },
          signal: controller.signal,
        });
        if (!alive) return;
        setData(response.data.data);
        setTotal(response.data.total);
      } catch (err) {
        if (!alive || axios.isCancel(err)) return;
        setError(err.response?.data?.message ?? 'Không thể tải sản phẩm');
      } finally {
        if (alive) setLoading(false);
      }
    }, 400);

    return () => {
      alive = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, category, status, page, reload]);

  return { data, total, loading, error };
}
