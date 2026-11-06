export default function ConfirmDialog({ message, onConfirm, onCancel, busy }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="actions">
          <button onClick={onCancel} disabled={busy}>
            Batal
          </button>
          <button className="primary" onClick={onConfirm} disabled={busy}>
            {busy ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
