import { useState } from "react";

export const useStatusUpdater = (onConfirm) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdate = (status) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const confirmUpdate = () => {
    if (onConfirm) onConfirm(selectedStatus);
    setIsModalOpen(false);
  };

  return {
    selectedStatus,
    isModalOpen,
    handleUpdate,
    confirmUpdate,
    closeModal: () => setIsModalOpen(false),
  };
};
