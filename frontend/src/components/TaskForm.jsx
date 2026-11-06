import { useState } from "react";
import { STATUS_OPTIONS, isoToLocalInput, localInputToIso } from "../utils.js";

export default function TaskForm({ initial, courses, onSubmit, onCancel }) {
  const editing = Boolean(initial);

  const [taskName, setTaskName] = useState(initial?.task_name || "");
  const [courseId, setCourseId] = useState(initial?.course_id ? String(initial.course_id) : "");
  const [deadline, setDeadline] = useState(isoToLocalInput(initial?.deadline));
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState(initial?.status || "pending");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!taskName.trim()) return setError("Nama tugas wajib diisi.");
    if (!courseId) return setError("Pilih mata kuliah.");
    if (!deadline) return setError("Deadline wajib diisi.");

    const deadlineIso = localInputToIso(deadline);
    if (!deadlineIso) return setError("Format deadline tidak valid.");

    const payload = {
      task_name: taskName.trim(),
      course_id: Number(courseId),
      deadline: deadlineIso,
      description: description.trim() || null
    };
    // Status hanya dikirim saat edit (POST backend tidak menerima status; default dari database)
    if (editing) payload.status = status;

    setBusy(true);
    setError("");
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="form box" onSubmit={handleSubmit}>
      <h3>{editing ? "Edit Tugas" : "Tambah Tugas"}</h3>
      {error && <p className="error">{error}</p>}

      <label>
        Nama tugas
        <input value={taskName} onChange={(e) => setTaskName(e.target.value)} autoFocus />
      </label>

      <label>
        Mata kuliah
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">-- Pilih mata kuliah --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Deadline
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </label>

      <label>
        Deskripsi (opsional)
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      {editing && (
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      )}

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
