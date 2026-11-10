import React, { useState, useEffect } from 'react';
import { GLOBAL_SUCCESS_UNITS } from '../data/unitsData';
import { CheckCircle } from 'lucide-react';

interface Assignment {
  id: string;
  unitNumber: number;
  title: string;
  dateAssigned: string;
}

export const AssignmentHub: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<number>(GLOBAL_SUCCESS_UNITS[0].unitNumber);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/teacher/assignments');
      const data = await res.json();
      setAssignments(data);
    } catch (e) {
      console.error('Failed to fetch assignments', e);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAssign = async () => {
    setLoading(true);
    try {
      const unit = GLOBAL_SUCCESS_UNITS.find(u => u.unitNumber === selectedUnit);
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitNumber: selectedUnit,
          title: unit?.title || `Unit ${selectedUnit}`,
        }),
      });
      if (res.ok) {
        await fetchAssignments();
      }
    } catch (e) {
      console.error('Assign error', e);
    }
    setLoading(false);
  };

  const handleViewReport = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/assignments/${id}/report`);
      const report = await res.json();
      alert(`Báo cáo cho Assignment ${id}\nTrung bình streak: ${report.avgStreak}%\nHoàn thành: ${report.avgCompletion}%\nIPA: ${report.avgIpaScore}%`);
    } catch (e) {
      console.error('Report error', e);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
      <h3 className="text-xl font-black text-white">Trung tâm Giao bài &amp; Thách đấu</h3>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <select
          className="rounded bg-slate-800 border border-slate-700 text-white p-2"
          value={selectedUnit}
          onChange={e => setSelectedUnit(Number(e.target.value))}
        >
          {GLOBAL_SUCCESS_UNITS.map(unit => (
            <option key={unit.unitNumber} value={unit.unitNumber}>
              Unit {unit.unitNumber}: {unit.title}
            </option>
          ))}
        </select>
        <button
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded"
          onClick={handleAssign}
          disabled={loading}
        >
          <CheckCircle className="w-4 h-4" />
          Giao bài tập cho lớp
        </button>
      </div>

      {/* List of assignments */}
      {assignments.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full table-auto text-sm text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-800">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Unit</th>
                <th className="px-4 py-2">Ngày giao</th>
                <th className="px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, idx) => (
                <tr key={a.id} className="border-b border-slate-700 hover:bg-slate-800">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{a.title}</td>
                  <td className="px-4 py-2">{new Date(a.dateAssigned).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1 px-2 rounded"
                      onClick={() => handleViewReport(a.id)}
                    >
                      Xem báo cáo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
