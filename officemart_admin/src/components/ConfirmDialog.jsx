export default function ConfirmDialog({ product, onCancel, onConfirm, loading = false }) {
  if (!product) return null;

  return (
    <div className="dialog-backdrop">
      <div className="confirm-dialog" data-testid="confirm-dialog" role="dialog" aria-modal="true">
        <h2>Xác nhận xoá</h2>
        <p>Bạn có chắc muốn xoá sản phẩm “{product.name}” không?</p>
        <div className="confirm-actions">
          <button type="button" className="secondary-button" data-testid="confirm-no" onClick={onCancel} disabled={loading}>
            Huỷ
          </button>
          <button type="button" className="danger-button" data-testid="confirm-yes" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xoá...' : 'Đồng ý'}
          </button>
        </div>
      </div>
    </div>
  );
}
