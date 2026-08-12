import { useMemo, useState } from "react";

export const useCalendar = (initialMonth = new Date()) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth()),
  );

  const generateCalendar = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction));
  };

  return {
    currentMonth,
    generateCalendar,
    navigateMonth,
    setCurrentMonth,
  };
};

