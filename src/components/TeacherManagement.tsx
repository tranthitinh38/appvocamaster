import React, { useEffect, useState } from 'react';
import { TeacherDashboard } from './TeacherDashboard';
import { UserProgress } from '../types';
import { useAuth } from '../utils/AuthContext';
import { StudentDetail } from './StudentDetail';

/**
 * Component visible only to teachers.
 * It loads the list of students (their progress) from localStorage
 * and renders the TeacherDashboard. Allows editing student names
 * and viewing per‑unit detailed scores.
 */
export const TeacherManagement: React.FC = () => {
  const { user } = useAuth();
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Load class data from localStorage
  const loadClassData = () => {
    if (user.role !== 'teacher') return;
    const CLASS_KEY = 'global_success_8_class_students';
    const saved = localStorage.getItem(CLASS_KEY);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setClassStudents(arr);
      } catch (e) {
        console.warn('Failed to parse class student data', e);
      }
    }
  };

  useEffect(() => {
    loadClassData();
    // eslint‑disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  // Edit a student's name
  const handleEditStudent = (id: string, newName: string) => {
    const updated = classStudents.map((s) => (s.id === id ? { ...s, name: newName } : s));
    setClassStudents(updated);
    const CLASS_KEY = 'global_success_8_class_students';
    localStorage.setItem(CLASS_KEY, JSON.stringify(updated));
  };

  // Select a student to view detailed unit scores
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
  };

  // Back from detail view
  const handleBack = () => {
    setSelectedStudentId(null);
  };

  // Hide component for non‑teacher users
  if (user.role !== 'teacher') return null;

  // If a student is selected, show detailed view
  if (selectedStudentId) {
    const student = classStudents.find((s) => s.id === selectedStudentId);
    return student ? (
      <StudentDetail student={student} onBack={handleBack} />
    ) : (
      <div className="p-4 text-red-400">Student not found.</div>
    );
  }

  return (
    <TeacherDashboard
      classStudents={classStudents}
      onEditStudent={handleEditStudent}
      onSelectStudent={handleSelectStudent}
    />
  );
};
