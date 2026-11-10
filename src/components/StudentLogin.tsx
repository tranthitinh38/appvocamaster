import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';

/** Simple login form for students */
export const StudentLogin: React.FC = () => {
  const { setUser } = useAuth();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // set user with role student
      setUser({ id: Date.now().toString(), name: name.trim(), role: 'student' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-lg shadow-lg w-80"
      >
        <h2 className="text-lg font-semibold mb-4 text-center">
          Đăng nhập học sinh
        </h2>
        <input
          type="text"
          placeholder="Tên học sinh"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          required
        />
        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-medium"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
};
