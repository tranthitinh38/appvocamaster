import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';

/** General login form for both students and teachers */
export const Login: React.FC = () => {
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUser({ id: Date.now().toString(), name: name.trim(), role });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4 text-center">Đăng nhập</h2>
        <input
          type="text"
          placeholder="Tên người dùng"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          required
        />
        <div className="flex justify-center mb-4">
          <label className="mr-2 text-sm">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === 'student'}
              onChange={() => setRole('student')}
            />
            Học sinh
          </label>
          <label className="ml-2 text-sm">
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={role === 'teacher'}
              onChange={() => setRole('teacher')}
            />
            Giáo viên
          </label>
        </div>
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
