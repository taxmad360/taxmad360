'use client'
import { useState } from 'react'

export default function DriverDashboard() {
  const [status, setStatus] = useState('OFFLINE');

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#eef2f6]">
      <div className="w-full max-w-sm p-6 bg-white rounded-3xl shadow-lg text-center">
        <div className="flex justify-between items-center mb-10">
          <h2 className="font-bold text-[#112F5C]">TaxMad Driver</h2>
          <span className={`px-3 py-1 rounded-full text-xs ${status === 'ONLINE' ? 'bg-green-200' : 'bg-red-200'}`}>
            {status}
          </span>
        </div>
        
        <button 
          className="w-full py-4 bg-[#00B5FF] text-white rounded-xl font-bold"
          onClick={() => setStatus(status === 'OFFLINE' ? 'ONLINE' : 'OFFLINE')}
        >
          {status === 'OFFLINE' ? 'IR ONLINE' : 'IR OFFLINE'}
        </button>
      </div>
    </div>
  );
}
