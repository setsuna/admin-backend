/**
 * 我的会议页面
 * 
 * 显示当前用户参与的会议列表
 */

import React from 'react'

const MyMeetingPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">我的会议</h1>
        <p className="text-gray-500 mt-1">查看我参与的所有会议</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">我的会议页面</h3>
          <p className="text-gray-500 text-center max-w-md">
            此页面将显示您作为参与者或组织者的所有会议。
            <br />
            页面功能待开发。
          </p>
        </div>
      </div>
    </div>
  )
}

export default MyMeetingPage
