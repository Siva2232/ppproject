const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-80">
      <h2 className="text-gray-800 font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 text-sm mb-4">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
