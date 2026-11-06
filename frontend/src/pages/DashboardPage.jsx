import { useEffect, useState } from "react";
import { getTasks } from "../api.js";
import { formatDeadline, statusLabel } from "../utils.js";

export default function DashboardPage({ onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getTasks()
      .then((data) => active && setTasks(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p>Memuat...</p>;
  if (error) return <p className="error">{error}</p>;

  const count = (s) => tasks.filter((t) => t.status === s).length;

  // Tugas belum selesai dengan deadline terdekat (data sudah terurut ascending dari API)
  const upcoming = tasks.filter((t) => t.status !== "completed").slice(0, 5);

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="stats">
        <div className="box stat">
          <div className="stat-num">{tasks.length}</div>
          <div>Total tugas</div>
        </div>
        <div className="box stat">
          <div className="stat-num">{count("pending")}</div>
          <div>Pending</div>
        </div>
        <div className="box stat">
          <div className="stat-num">{count("in_progress")}</div>
          <div>In Progress</div>
        </div>
        <div className="box stat">
          <div className="stat-num">{count("completed")}</div>
          <div>Completed</div>
        </div>
      </div>

      <h3>Deadline terdekat</h3>
      {upcoming.length === 0 ? (
        <p className="muted">Tidak ada tugas yang belum selesai.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tugas</th>
              <th>Mata kuliah</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((t) => (
              <tr key={t.id}>
                <td>{t.task_name}</td>
                <td>{t.courses?.name || "-"}</td>
                <td>{formatDeadline(t.deadline)}</td>
                <td>{statusLabel(t.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p>
        <button onClick={() => onNavigate("tasks")}>Kelola tugas</button>
      </p>
    </div>
  );
}
