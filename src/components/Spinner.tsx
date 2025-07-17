const Spinner = () => (
  <div className="flex flex-col justify-center items-center p-8">
    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500">검색 중...</p>
  </div>
);

export default Spinner;
