import { useState } from "react";

export default function CourseForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama mata kuliah wajib diisi.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="form box" onSubmit={handleSubmit}>
      <h3>{initial ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}</h3>
      {error && <p className="error">{error}</p>}
      <label>
        Nama mata kuliah
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </label>
      <div className="actions">
        <button type="button" onClick={onCancel} disabled={busy}>
          Batal
        </button>
        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
