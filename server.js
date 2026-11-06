
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

const { createUserClient } = require("./config/supabase");
const authenticateUser = require("./middleware/auth");

const { supabase } = require("./config/supabase");

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Competition Registration API is running"
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({
      message: "Login failed",
      error: error.message
    });
  }

  res.json({
    message: "Login successful",
    access_token: data.session.access_token,
    token_type: data.session.token_type,
    expires_at: data.session.expires_at,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  });
});

app.get("/api/courses", authenticateUser, async (req, res) => {
  const userSupabase = createUserClient(req.accessToken);

  const { data, error } = await userSupabase
    .from("courses")
    .select("*");

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message
    });
  }

  res.json(data);
});

// CREATE COURSE
app.post("/api/courses", authenticateUser, async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Course name is required"
    });
  }

  const userSupabase = createUserClient(req.accessToken);

  const { data, error } = await userSupabase
    .from("courses")
    .insert({
      name: name.trim(),
      user_id: req.user.id
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      message: "Failed to create course",
      error: error.message
    });
  }

  res.status(201).json({
    message: "Course created successfully",
    data
  });
});


// UPDATE COURSE
app.patch("/api/courses/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Course name is required"
    });
  }

  const userSupabase = createUserClient(req.accessToken);

  const { data, error } = await userSupabase
    .from("courses")
    .update({
      name: name.trim()
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (!data && !error) {
  return res.status(404).json({
    message: "Course not found"
  });
}

  if (error) {
    return res.status(500).json({
      message: "Failed to update course",
      error: error.message
    });
  }

  res.json({
    message: "Course updated successfully",
    data
  });
});

// DELETE COURSE
app.delete("/api/courses/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  const userSupabase = createUserClient(req.accessToken);

  const { data, error } = await userSupabase
    .from("courses")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  if (!data && !error) {
  return res.status(404).json({
    message: "Course not found"
  });
}

  if (error) {
    return res.status(500).json({
      message: "Failed to delete course",
      error: error.message
    });
  }

  res.json({
    message: "Course deleted successfully",
    data
  });
});

app.get("/api/tasks", authenticateUser, async (req, res) => {
  const { course_id, status } = req.query;

  const validStatuses = ["pending", "in_progress", "completed"];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status filter"
    });
  }

  const userSupabase = createUserClient(req.accessToken);

  let query = userSupabase
    .from("tasks")
    .select(`
      *,
      courses!tasks_course_owner_fk (
        id,
        name
      )
    `);

  if (course_id) {
    query = query.eq("course_id", course_id);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("deadline", { ascending: true });

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }

  res.json(data);
});

app.post("/api/tasks", authenticateUser, async (req, res) => {
  const { task_name, course_id, deadline, description } = req.body;

  // Validasi task_name
  if (typeof task_name !== "string" || !task_name.trim()) {
    return res.status(400).json({
      message: "Task name must be a non-empty string"
    });
  }

  // Validasi course_id
  const parsedCourseId = Number(course_id);

  if (
    course_id === undefined ||
    course_id === null ||
    course_id === "" ||
    !Number.isInteger(parsedCourseId) ||
    parsedCourseId <= 0
  ) {
    return res.status(400).json({
      message: "Course ID must be a positive integer"
    });
  }

  // Validasi deadline
  if (typeof deadline !== "string" || !deadline.trim()) {
    return res.status(400).json({
      message: "Deadline is required"
    });
  }

  const parsedDeadline = new Date(deadline);

  if (Number.isNaN(parsedDeadline.getTime())) {
    return res.status(400).json({
      message: "Invalid deadline format"
    });
  }

  // Validasi description
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return res.status(400).json({
      message: "Description must be a string or null"
    });
  }

  const userSupabase = createUserClient(req.accessToken);

  const { data, error } = await userSupabase
    .from("tasks")
    .insert({
      task_name: task_name.trim(),
      course_id: parsedCourseId,
      deadline: parsedDeadline.toISOString(),
      description: description?.trim() || null,
      user_id: req.user.id
    })
    .select(`
      *,
      courses!tasks_course_owner_fk (
        id,
        name
      )
    `)
    .single();

  if (error) {
    return res.status(500).json({
      message: "Failed to create task",
      error: error.message
    });
  }

  res.status(201).json({
    message: "Task created successfully",
    data
  });
});

app.patch("/api/tasks/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { task_name, course_id, deadline, description, status } = req.body;

  const updates = {};

  // Validasi task_name
  if (task_name !== undefined) {
    if (typeof task_name !== "string" || !task_name.trim()) {
      return res.status(400).json({
        message: "Task name must be a non-empty string"
      });
    }

    updates.task_name = task_name.trim();
  }

  // Validasi course_id
  if (course_id !== undefined) {
    const parsedCourseId = Number(course_id);

    if (
      course_id === null ||
      course_id === "" ||
      !Number.isInteger(parsedCourseId) ||
      parsedCourseId <= 0
    ) {
      return res.status(400).json({
        message: "Course ID must be a positive integer"
      });
    }

    updates.course_id = parsedCourseId;
  }

  // Validasi deadline
  if (deadline !== undefined) {
    if (typeof deadline !== "string" || !deadline.trim()) {
      return res.status(400).json({
        message: "Deadline must be a valid date string"
      });
    }

    const parsedDeadline = new Date(deadline);

    if (Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        message: "Invalid deadline format"
      });
    }

    updates.deadline = parsedDeadline.toISOString();
  }

  // Validasi description
  if (description !== undefined) {
    if (description !== null && typeof description !== "string") {
      return res.status(400).json({
        message: "Description must be a string or null"
      });
    }

    updates.description = description?.trim() || null;
  }

  // Validasi status
  if (status !== undefined) {
    const validStatuses = ["pending", "in_progress", "completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      message: "No fields provided for update"
    });
  }

  const userSupabase = createUserClient(req.accessToken);

  const { data, error } = await userSupabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      courses!tasks_course_owner_fk (
        id,
        name
      )
    `)
    .maybeSingle();

  if (!data && !error) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  if (error) {
    return res.status(500).json({
      message: "Failed to update task",
      error: error.message
    });
  }

  res.json({
    message: "Task updated successfully",
    data
  });
});
``
app.delete("/api/tasks/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  const userSupabase = createUserClient(req.accessToken);

  const { data, error } = await userSupabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  if (!data && !error) {
  return res.status(404).json({
    message: "Course not found"
  });
}

  if (error) {
    return res.status(500).json({
      message: "Failed to delete task",
      error: error.message
    });
  }

  res.json({
    message: "Task deleted successfully",
    data
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
