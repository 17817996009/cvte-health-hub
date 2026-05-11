import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mt-4">页面未找到</h2>
      <p className="text-gray-500 mt-2">您访问的页面不存在</p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
      >
        返回首页
      </Link>
    </div>
  );
};

export default NotFound;