import { useState } from "react";

export const useFormData = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => setFormData(initialData);

  return { formData, handleInputChange, resetForm, setFormData };
};

