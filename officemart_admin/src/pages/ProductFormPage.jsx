import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosClient.js';

const emptyForm = { name: '', sku: '', category: '', price: '', stock: '', status: 'active' };

function validate(form) {
  const errors = {};
  const name = form.name.trim();
  if (!name) errors.name = 'Tên sản phẩm là bắt buộc';
  else if (name.length < 3 || name.length > 100) errors.name = 'Tên phải có từ 3 đến 100 ký tự';
  if (!/^[A-Z]{3}-\d{4}$/.test(form.sku)) errors.sku = 'SKU phải có dạng ABC-1234';
  if (!form.category) errors.category = 'Vui lòng chọn danh mục';
  if (form.price === '' || Number(form.price) <= 0) errors.price = 'Giá phải lớn hơn 0';
  if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = 'Tồn kho phải là số nguyên không âm';
  return errors;
}

export default function ProductFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = mode === 'edit';
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories').then((response) => setCategories(response.data));
    if (!editing) return undefined;
    let alive = true;
    api.get(`/products/${id}`)
      .then((response) => {
        if (!alive) return;
        const product = response.data;
        setForm({ name: product.name, sku: product.sku, category: product.category, price: String(product.price), stock: String(product.stock), status: product.status });
      })
      .catch((err) => { if (alive) setErrors({ form: err.response?.status === 404 ? 'Không tìm thấy sản phẩm' : 'Không thể tải sản phẩm' }); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [editing, id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '', form: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      setSaving(true);
      const body = { ...form, name: form.name.trim(), price: Number(form.price), stock: Number(form.stock) };
      if (editing) await api.put(`/products/${id}`, body);
      else await api.post('/products', body);
      navigate('/products', { state: { toast: editing ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm' } });
    } catch (err) {
      const message = err.response?.data?.message ?? 'Không thể lưu sản phẩm';
      const field = err.response?.data?.field;
      setErrors(field ? { [field]: message } : { form: message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="page"><p className="loading" data-testid="loading">Đang tải...</p></main>;

  return (
    <main className="page">
      <div className="form-card">
        <h1>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
        {errors.form && <p className="field-error">{errors.form}</p>}
        <form className="product-form" data-testid="product-form" onSubmit={handleSubmit} noValidate>
          <FormField label="Tên sản phẩm" name="name" value={form.name} onChange={handleChange} error={errors.name} />
          <FormField label="SKU" name="sku" value={form.sku} onChange={handleChange} error={errors.sku} />
          <div className="form-field">
            <label htmlFor="category">Danh mục</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {errors.category && <span className="field-error" data-testid="field-error-category">{errors.category}</span>}
          </div>
          <FormField label="Giá" name="price" type="number" value={form.price} onChange={handleChange} error={errors.price} />
          <FormField label="Tồn kho" name="stock" type="number" value={form.stock} onChange={handleChange} error={errors.stock} />
          <div className="form-field">
            <label htmlFor="status">Trạng thái</label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="primary-button" data-testid="submit-button" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
            <button className="secondary-button" type="button" onClick={() => navigate('/products')} disabled={saving}>Huỷ</button>
          </div>
        </form>
      </div>
    </main>
  );
}

function FormField({ label, name, type = 'text', value, onChange, error }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} />
      {error && <span className="field-error" data-testid={`field-error-${name}`}>{error}</span>}
    </div>
  );
}
