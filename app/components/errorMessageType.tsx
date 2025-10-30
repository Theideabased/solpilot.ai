const ErrorMessageType = ({
  text = "",
  handleExit,
  isLastError,
}: {
  text?: string;
  handleExit: () => void;
  isLastError: boolean;
}) => {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white max-w-[75%] shadow-lg border border-red-500">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <span className="text-2xl">❌</span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-2">Error</h4>
          <p className="text-red-50 leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      </div>

      {isLastError && (
        <button
          type="button"
          onClick={handleExit}
          className="mt-4 px-5 py-2 bg-white text-red-700 font-semibold rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-md"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

export default ErrorMessageType;
