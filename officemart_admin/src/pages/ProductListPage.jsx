import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import ProductTable from '../components/ProductTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import useProductSearch from '../hooks/useProductSearch.js';

export default function ProductListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [reload, setReload] = useState(0);

  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? '';
  const rawPage = Number(searchParams.get('page') ?? 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const { data: products, total, loading, error } = useProductSearch({ q, category, status, page, reload });
  const totalPages = Math.max(1, Math.ceil(total / 10));

  useEffect(() => {
    api.get('/categories')
      .then((response) => setCategories(response.data))
      .catch(() => setCategoryError('Không thể tải danh mục'));
  }, []);

  useEffect(() => {
    if (page > totalPages && total > 0) updateParams({ page: totalPages }, true);
  }, [page, totalPages, total]);

  useEffect(() => {
    const message = location.state?.toast;
    if (message) {
      setToast(message);
      navigate('/products', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function updateParams(changes, replace = false) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === 1 && key === 'page') next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace });
  }

  function handleSearch(event) { updateParams({ q: event.target.value, page: 1 }); }
  function handleCategory(event) { updateParams({ category: event.target.value, page: 1 }); }
  function handleStatus(event) { updateParams({ status: event.target.value, page: 1 }); }

  async function handleDelete() {
    if (!confirmProduct) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/products/${confirmProduct.id}`);
      setConfirmProduct(null);
      setToast('Đã xoá sản phẩm');
      setReload((value) => value + 1);
    } catch (err) {
      setToast(err.response?.data?.message ?? 'Không thể xoá sản phẩm');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="page-title">
        <h1>Sản phẩm</h1>
        <button className="primary-button" data-testid="add-button" onClick={() => navigate('/products/new')}>Thêm sản phẩm</button>
      </div>

      <div className="toolbar">
        <label> Tìm kiếm
          <input data-testid="search-input" value={q} onChange={handleSearch} placeholder="Tên hoặc SKU" />
        </label>
        <label> Danh mục
          <select data-testid="category-filter" value={category} onChange={handleCategory}>
            <option value="">Tất cả</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label> Trạng thái
          <select data-testid="status-filter" value={status} onChange={handleStatus}>
            <option value="">Tất cả</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </label>
      </div>

      {categoryError && <p className="field-error">{categoryError}</p>}
      {loading && <p className="loading" data-testid="loading">Đang tải...</p>}
      {!loading && error && <div className="error-box" data-testid="error-message"><p>{error}</p><button className="secondary-button" data-testid="retry-button" onClick={() => setReload((value) => value + 1)}>Thử lại</button></div>}
      {!loading && !error && products.length === 0 && <p className="empty-state" data-testid="empty-state">Không có sản phẩm</p>}
      {!loading && !error && products.length > 0 && <div className="table-wrap"><ProductTable products={products} onEdit={(id) => navigate(`/products/${id}/edit`)} onDelete={setConfirmProduct} /></div>}

      <div className="pagination" data-testid="pagination">
        <button data-testid="page-prev" disabled={page <= 1} onClick={() => updateParams({ page: page - 1 })}>Trước</button>
        <span data-testid="page-current">{page} / {totalPages}</span>
        <button data-testid="page-next" disabled={page >= totalPages} onClick={() => updateParams({ page: page + 1 })}>Sau</button>
      </div>

      <ConfirmDialog product={confirmProduct} onCancel={() => setConfirmProduct(null)} onConfirm={handleDelete} loading={deleteLoading} />
      {toast && <div className="toast" data-testid="toast">{toast}</div>}
    </main>
  );
}
