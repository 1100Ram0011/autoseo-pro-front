import React from 'react';
import ModalWrapper from './ModalWrapper';
import MetaWhatsappNumberSettings from '@/components/MetaWhatsapp/MetaWhatsappNumberSettings';

export default function MetaNumberSettingsModal({ isOpen, onClose, selectedNumber }) {
  if (!isOpen || !selectedNumber) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Number Settings"
      maxWidth="780px"
      accentColors="from-emerald-500 via-teal-400 to-blue-500"
      footer={
        <button
          onClick={onClose}
          className="px-5 py-2 text-xs font-bold rounded text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-xs"
        >
          Done / Close
        </button>
      }
    >
      <MetaWhatsappNumberSettings 
        phoneNumberId={selectedNumber.phoneNumberId} 
        selectedNumber={selectedNumber}
        onClose={onClose}
      />
    </ModalWrapper>
  );
}

