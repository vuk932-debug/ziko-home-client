import React, { useState } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

interface DevOtp {
  id: string;
  identifier: string;
  otp: string;
  resetToken: string | null;
  createdAt: string;
  expiresAt: string;
}

const OTPViewer: React.FC = () => {
  const { showNotification, confirm } = useNotification();
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState(localStorage.getItem('DEV_OTP_SECRET') || '');
  const [results, setResults] = useState<DevOtp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOtps = async (isLatest: boolean = false) => {
    setLoading(true);
    setError(null);
    localStorage.setItem('DEV_OTP_SECRET', secret);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const endpoint = isLatest 
        ? `${baseUrl}/dev/otp/latest` 
        : `${baseUrl}/dev/otp/by-identifier?identifier=${identifier}`;

      const response = await axios.get(endpoint, {
        headers: {
          'x-dev-secret': secret
        }
      });

      setResults(response.data);
      if (response.data.length === 0) {
        setError('No OTPs found for this identifier.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch OTPs. Check your secret and network.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const cleanupDevOtps = async () => {
    const confirmed = await confirm({
      message: 'Are you sure you want to clear all dev OTPs?',
      type: 'danger'
    });
    if (!confirmed) return;
    
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      await axios.post(`${baseUrl}/dev/otp/cleanup`, {}, {
        headers: { 'x-dev-secret': secret }
      });
      setResults([]);
      showNotification('success', 'Cleanup successful!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cleanup failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatResetLink = (tokenOrUrl: string) => {
    if (tokenOrUrl.startsWith('http')) return tokenOrUrl;
    // Fallback if it's just a token from an old entry
    const baseUrl = window.location.origin;
    return `${baseUrl}/reset-password/${tokenOrUrl}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('info', 'Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">🛠 ZikoHome Dev OTP Viewer</h1>
            <p className="text-gray-400 mt-2">Internal Tool - Secure testing only.</p>
          </div>
          <button 
            onClick={cleanupDevOtps}
            disabled={loading}
            className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 px-3 py-2 rounded transition"
          >
            Clear All Dev OTPs
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Dev Secret Key</label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter DEV_OTP_SECRET"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">Search</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email or Phone</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="test@example.com"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchOtps(false)}
                  disabled={loading || !identifier}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded font-semibold transition"
                >
                  Search by ID
                </button>
                <button
                  onClick={() => fetchOtps(true)}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 px-4 py-2 rounded font-semibold transition"
                >
                  Fetch Latest
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">Results ({results.length})</h2>
          {results.length === 0 && !loading && !error && (
            <p className="text-gray-500 italic">No search performed yet.</p>
          )}

          {results.map((item) => (
            <div key={item.id} className="bg-gray-800 border-l-4 border-blue-500 p-6 rounded-lg shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-400">Identifier</p>
                  <p className="text-lg font-mono font-bold text-blue-300">{item.identifier}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Created At</p>
                  <p className="text-xs">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    {item.otp === 'RESET_LINK' ? 'Type' : 'OTP Code'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-mono tracking-widest ${item.otp === 'RESET_LINK' ? 'text-blue-400 text-xl' : 'text-green-400'}`}>
                      {item.otp}
                    </span>
                    {item.otp !== 'RESET_LINK' && (
                      <button 
                        onClick={() => copyToClipboard(item.otp)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>

                {item.resetToken && (
                  <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      {item.otp === 'RESET_LINK' ? 'Full Reset Link' : 'Token'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-blue-400 truncate mr-2">
                        {item.resetToken}
                      </span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => copyToClipboard(item.resetToken!)}
                          className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition"
                        >
                          Copy
                        </button>
                        {item.otp === 'RESET_LINK' && (
                          <a 
                            href={formatResetLink(item.resetToken!)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded transition text-white"
                          >
                            Open
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <p>ID: {item.id}</p>
                <p className={new Date(item.expiresAt) < new Date() ? 'text-red-400' : 'text-yellow-400'}>
                  Expires: {new Date(item.expiresAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OTPViewer;
