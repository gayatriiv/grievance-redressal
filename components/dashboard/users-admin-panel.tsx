"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "student" | "department" | "admin";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string | null;
  rollNumber?: string | null;
  createdAt: string;
};

export const UsersAdminPanel = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [department, setDepartment] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role>("student");
  const [editingDepartment, setEditingDepartment] = useState("");
  const [editingRollNumber, setEditingRollNumber] = useState("");

  const canSubmit = useMemo(() => {
    if (!name.trim() || !email.trim()) return false;
    if (role === "department" && !department.trim()) return false;
    return true;
  }, [name, email, role, department]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to load users");
      setUsers(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role,
          department: department || undefined,
          rollNumber: rollNumber || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to create user");
      setMsg("User created.");
      setName("");
      setEmail("");
      setRole("student");
      setDepartment("");
      setRollNumber("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to create user");
    }
  };

  const startEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setEditingRole(user.role);
    setEditingDepartment(user.department ?? "");
    setEditingRollNumber(user.rollNumber ?? "");
    setMsg("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDepartment("");
    setEditingRollNumber("");
  };

  const onSaveEdit = async () => {
    if (!editingId) return;
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          role: editingRole,
          department: editingDepartment || undefined,
          rollNumber: editingRole === "student" ? editingRollNumber || undefined : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to update user");
      setMsg("User updated.");
      setEditingId(null);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to update user");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setMsg("");
    setError("");
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to delete user");
      setMsg("User deleted.");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="clean-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Add user</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a DB user so they can sign in with Google (role comes from DB).
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onCreate}>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@student.mes.ac.in or user@mes.ac.in"
              type="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</label>
            <select
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/20"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="student">Student</option>
              <option value="department">Department</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/20"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder={role === "department" ? "e.g. Computer Engineering" : "Administration (optional)"}
              required={role === "department"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Roll number</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/20"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Optional (students)"
              disabled={role !== "student"}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              disabled={!canSubmit}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Create user
            </button>
            {msg && <p className="text-sm text-emerald-400">{msg}</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </form>
      </div>

      <div className="clean-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Users</h2>
            <p className="mt-1 text-sm text-muted-foreground">All users in DB.</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/20"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Roll</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isEditing = editingId === u.id;
                  return (
                    <tr key={u.id} className="rounded-xl border border-border bg-background/40">
                      <td className="px-3 py-3 text-sm text-foreground">{u.name}</td>
                      <td className="px-3 py-3 text-sm text-foreground">{u.email}</td>
                      <td className="px-3 py-3 text-sm text-foreground">
                        {isEditing ? (
                          <select
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value as Role)}
                          >
                            <option value="student">Student</option>
                            <option value="department">Department</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          u.role
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">
                        {isEditing ? (
                          <input
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                            value={editingDepartment}
                            onChange={(e) => setEditingDepartment(e.target.value)}
                            placeholder={editingRole === "department" ? "e.g. Computer Engineering" : "Administration (optional)"}
                          />
                        ) : (
                          u.department || "-"
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">
                        {isEditing ? (
                          <input
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                            value={editingRollNumber}
                            onChange={(e) => setEditingRollNumber(e.target.value)}
                            placeholder="Optional (students)"
                            disabled={editingRole !== "student"}
                          />
                        ) : (
                          u.rollNumber || "-"
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={onSaveEdit}
                              className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background hover:opacity-90"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-foreground/20"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(u)}
                              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-foreground/20"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(u.id)}
                              className="rounded-full border border-red-500/60 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

