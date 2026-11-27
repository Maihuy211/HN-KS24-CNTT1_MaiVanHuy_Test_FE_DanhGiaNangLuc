import { categoryNames } from '../data/sample.js';

export default function ProductRow({ product, onEdit, onDelete }) {
  return (
    <tr data-testid="product-row">
      <td data-label="Tên">{product.name}</td>
      <td data-label="SKU">{product.sku}</td>
      <td data-label="Danh mục">{categoryNames[product.category] ?? product.category}</td>
      <td data-label="Giá">{new Intl.NumberFormat('vi-VN').format(product.price)} ₫</td>
      <td data-label="Tồn kho" className={product.stock === 0 ? 'out-of-stock' : ''}>
        {product.stock === 0 ? 'Hết hàng' : product.stock}
      </td>
      <td data-label="Trạng thái">
        <span data-testid="product-status" className={product.status === 'active' ? 'status-active' : 'status-inactive'}>
          {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
        </span>
      </td>
      <td data-label="Thao tác" className="actions-cell">
        <button type="button" data-testid="edit-button" onClick={() => onEdit?.(product.id)}>Sửa</button>
        <button type="button" data-testid="delete-button" onClick={() => onDelete?.(product)}>Xoá</button>
      </td>
    </tr>
  );
}
