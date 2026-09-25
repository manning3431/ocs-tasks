import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TasksPage } from './pages/TasksPage';

export function App() {
  return (
    <BrowserRouter basename="/tasks">
      <Routes>
        <Route path="/*" element={<TasksPage />} />
      </Routes>
    </BrowserRouter>
  );
}