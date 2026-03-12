"use client";

import { useState } from "react";

export const AISettingsForm = () => {
  const [msg, setMsg] = useState("");

  return (
    <form
      className="glass space-y-4 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const response = await fetch("/api/ai-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData.entries())),
        });
        const data = await response.json();
        setMsg(data.message || "saved");
      }}
    >
      <select name="provider" className="w-full rounded-xl bg-white/10 p-3" defaultValue="groq">
        <option value="groq">Groq</option>
      </select>
      <input name="model" className="w-full rounded-xl bg-white/10 p-3" placeholder="llama-3.3-70b-versatile" defaultValue="llama-3.3-70b-versatile" required />
      <input name="apiKey" className="w-full rounded-xl bg-white/10 p-3" placeholder="API key" required />
      <button className="rounded-full bg-white px-6 py-2 text-background">Save Settings</button>
      {msg && <p className="text-emerald-400">{msg}</p>}
    </form>
  );
};
