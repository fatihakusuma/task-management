import { useCallback, useEffect, useState } from "react";
import { createCourse, deleteCourse, getCourses, updateCourse } from "../api.js";
import CourseForm from "../components/CourseForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formMode, setFormMode] = useState(null); // null | "create" | course object (edit)
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getCourses();
      setCourses([...data].sort((a, b) => a.id - b.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(name) {
    if (formMode === "create") {
      await createCourse(name);
    } else {
      await updateCourse(formMode.id, name);
    }
    setFormMode(null);
    await load();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteCourse(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(
        err.status === 500
          ? "Gagal menghapus. Mata kuliah mungkin masih dipakai oleh tugas."
          : err.message
      );
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Mata Kuliah</h2>
        <button className="primary" onClick={() => setFormMode("create")}>
          + Tambah mata kuliah
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {formMode && (
        <CourseForm
          initial={formMode === "create" ? null : formMode}
          onSubmit={handleSubmit}
          onCancel={() => setFormMode(null)}
        />
      )}

      {loading ? (
        <p>Memuat...</p>
      ) : courses.length === 0 ? (
        <p className="muted">Belum ada mata kuliah.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th className="col-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="col-actions">
                  <button onClick={() => setFormMode(c)}>Edit</button>
                  <button onClick={() => setToDelete(c)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {toDelete && (
        <ConfirmDialog
          message={`Hapus mata kuliah "${toDelete.name}"?`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
