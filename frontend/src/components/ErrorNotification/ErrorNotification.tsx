'use client';

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

export function ErrorNotification({ message, onClose }: ErrorNotificationProps) {
  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold">エラー</p>
          <p className="text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-red-700 hover:text-red-900 focus:outline-none"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
