import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import type { Notification } from '../../context/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-emerald-500" size={20} />,
  error: <AlertCircle className="text-rose-500" size={20} />,
  warning: <AlertTriangle className="text-amber-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
};

const bgColors = {
  success: 'bg-emerald-500/10 border-emerald-500/20',
  error: 'bg-rose-500/10 border-rose-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
  info: 'bg-blue-500/10 border-blue-500/20',
};

const Toast: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { removeNotification } = useNotification();

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg animate-in slide-in-from-right-10 duration-300 ${bgColors[notification.type]}`}>
      {icons[notification.type]}
      <p className="text-sm font-medium text-white flex-1">{notification.message}</p>
      <button 
        onClick={() => removeNotification(notification.id)}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <Toast notification={n} />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
