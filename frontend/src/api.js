// Semua komunikasi ke backend lewat file ini.
// Base URL kosong: request ke "/api/..." diteruskan oleh proxy Vite ke http://localhost:3000

const TOKEN_KEY = "tm_access_token";
const USER_KEY = "tm_user";
const EXPIRES_KEY = "tm_expires_at";

let onUnauthorized = () => {};

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function saveSession({ access_token, user, expires_at }) {
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (expires_at) localStorage.setItem(EXPIRES_KEY, String(expires_at));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function isSessionValid() {
  const token = getToken();
  if (!token) return false;
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY));
  // expires_at dari Supabase dalam detik (unix time)
  if (expiresAt && Date.now() / 1000 >= expiresAt) return false;
  return true;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server. Pastikan backend berjalan di port 3000.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // 401 pada endpoint terproteksi: sesi habis, paksa logout
    if (res.status === 401 && auth) {
      onUnauthorized();
    }
    const err = new Error(data?.message || `Permintaan gagal (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ---------- Auth ----------
export const login = (email, password) =>
  request("/api/auth/login", { method: "POST", body: { email, password }, auth: false });

// ---------- Courses ----------
export const getCourses = () => request("/api/courses");
export const createCourse = (name) => request("/api/courses", { method: "POST", body: { name } });
export const updateCourse = (id, name) =>
  request(`/api/courses/${id}`, { method: "PATCH", body: { name } });
export const deleteCourse = (id) => request(`/api/courses/${id}`, { method: "DELETE" });

// ---------- Tasks ----------
export function getTasks({ course_id, status } = {}) {
  const params = new URLSearchParams();
  if (course_id) params.set("course_id", course_id);
  if (status) params.set("status", status);
  const qs = params.toString();
  return request(`/api/tasks${qs ? `?${qs}` : ""}`);
}
export const createTask = (payload) => request("/api/tasks", { method: "POST", body: payload });
export const updateTask = (id, payload) =>
  request(`/api/tasks/${id}`, { method: "PATCH", body: payload });
export const deleteTask = (id) => request(`/api/tasks/${id}`, { method: "DELETE" });
