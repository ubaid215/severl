'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'success' | 'info' | 'warning';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default: return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white';
      case 'success': return 'bg-green-500 hover:bg-green-600 focus:ring-green-500 text-white';
      case 'warning': return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 text-black';
      default: return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getIcon()}
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      {title}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {message}
                  </p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getConfirmButtonClass()}`}
                    onClick={onConfirm}
                  >
                    {confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}