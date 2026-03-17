"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "../../context/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messengerUsername, setMessengerUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signup(email, password, {
        phoneNumber,
        messengerUsername,
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded border bg-white p-6">
      <h1 className="mb-4 text-xl font-semibold">Signup</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          placeholder="name@student.nstu.edu.bd"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        <input
          className="w-full rounded border px-3 py-2"
          type="tel"
          placeholder="Phone number (optional, for WhatsApp)"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />

        <input
          className="w-full rounded border px-3 py-2"
          type="text"
          placeholder="Messenger username (optional)"
          value={messengerUsername}
          onChange={(event) => setMessengerUsername(event.target.value)}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button className="w-full rounded bg-blue-600 px-4 py-2 text-white" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Signup"}
        </button>
      </form>
    </section>
  );
}
