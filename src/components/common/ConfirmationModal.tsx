import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { AlertTriangle, Info, X } from 'lucide-react';

const ConfirmationModal: React.FC = () => {
  const { confirmConfig, closeConfirm } = useNotification();

  if (!confirmConfig) return null;

  const isDanger = confirmConfig.type === 'danger';

  return (
    <Transition.Root show={!!confirmConfig} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={() => closeConfirm(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {isDanger ? <AlertTriangle size={28} /> : <Info size={28} />}
                    </div>
                    <button
                      onClick={() => closeConfirm(false)}
                      className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Dialog.Title as="h3" className="text-2xl font-black text-white tracking-tight uppercase tracking-[0.1em]">
                      {confirmConfig.title || (isDanger ? 'Confirm Deletion' : 'Confirmation Required')}
                    </Dialog.Title>
                    <Dialog.Description className="text-slate-400 text-base leading-relaxed">
                      {confirmConfig.message}
                    </Dialog.Description>
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                      onClick={() => closeConfirm(false)}
                    >
                      {confirmConfig.cancelText || 'Abort'}
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-4 text-white rounded-2xl font-bold transition-all shadow-lg ${
                        isDanger 
                          ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20' 
                          : 'bg-primary-600 hover:bg-primary-500 shadow-primary-900/20'
                      }`}
                      onClick={() => closeConfirm(true)}
                    >
                      {confirmConfig.confirmText || (isDanger ? 'Execute' : 'Confirm')}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ConfirmationModal;
