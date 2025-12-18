"use client";

type LogoutModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function LogoutModal({ onConfirm, onCancel }: LogoutModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-white">
          Are you sure you want to log out?
        </h2>
        <div className="flex justify-between">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes, Log out
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
