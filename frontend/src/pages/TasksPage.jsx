import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, getCourses, getTasks, updateTask } from "../api.js";
import TaskForm from "../components/TaskForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { STATUS_OPTIONS, formatDeadline, statusLabel } from "../utils.js";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [formMode, setFormMode] = useState(null); // null | "create" | task object (edit)
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Mata kuliah dimuat sekali untuk dropdown filter dan form
  useEffect(() => {
    getCourses()
      .then((data) => setCourses([...data].sort((a, b) => a.id - b.id)))
      .catch((err) => setError(err.message));
  }, []);

  // Filter dikirim ke backend lewat query string; sorting deadline ascending dari backend
  const loadTasks = useCallback(async () => {
    setError("");
    try {
      const data = await getTasks({ course_id: filterCourse, status: filterStatus });
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterCourse, filterStatus]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleSubmit(payload) {
    if (formMode === "create") {
      await createTask(payload);
    } else {
      await updateTask(formMode.id, payload);
    }
    setFormMode(null);
    await loadTasks();
  }

  async function handleStatusChange(task, status) {
    setError("");
    try {
      await updateTask(task.id, { status });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTask(toDelete.id);
      setToDelete(null);
      await loadTasks();
    } catch (err) {
      setError(err.message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const noCourses = courses.length === 0;

  return (
    <div>
      <div className="page-head">
        <h2>Tugas</h2>
        <button
          className="primary"
          onClick={() => setFormMode("create")}
          disabled={noCourses}
          title={noCourses ? "Tambahkan mata kuliah terlebih dahulu" : ""}
        >
          + Tambah tugas
        </button>
      </div>

      {noCourses && !loading && (
        <p className="notice">Belum ada mata kuliah. Tambahkan mata kuliah dahulu sebelum membuat tugas.</p>
      )}

      <div className="filters">
        <label>
          Mata kuliah
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
            <option value="">Semua</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Semua</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <span className="muted">Urut: deadline terdekat</span>
      </div>

      {error && <p className="error">{error}</p>}

      {formMode && (
        <TaskForm
          initial={formMode === "create" ? null : formMode}
          courses={courses}
          onSubmit={handleSubmit}
          onCancel={() => setFormMode(null)}
        />
      )}

      {loading ? (
        <p>Memuat...</p>
      ) : tasks.length === 0 ? (
        <p className="muted">Tidak ada tugas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tugas</th>
              <th>Mata kuliah</th>
              <th>Deadline</th>
              <th>Status</th>
              <th className="col-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className={t.status === "completed" ? "done" : ""}>
                <td>
                  <strong>{t.task_name}</strong>
                  {t.description && <div className="muted small">{t.description}</div>}
                </td>
                <td>{t.courses?.name || "-"}</td>
                <td>{formatDeadline(t.deadline)}</td>
                <td>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t, e.target.value)}
                    aria-label={`Status ${t.task_name} (${statusLabel(t.status)})`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="col-actions">
                  <button onClick={() => setFormMode(t)}>Edit</button>
                  <button onClick={() => setToDelete(t)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {toDelete && (
        <ConfirmDialog
          message={`Hapus tugas "${toDelete.task_name}"?`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
