import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

export default function ActionDialog({ dialog, onClose, onSubmit }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(dialog?.initialValue || '');
    setError('');
    setBusy(false);
  }, [dialog]);

  if (!dialog) return null;

  async function submit(event) {
    event?.preventDefault();
    if (dialog.required && !value.trim()) {
      setError(dialog.validationMessage || 'Please complete this field.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await onSubmit(value);
      if (result !== false) onClose();
    } catch (submitError) {
      setError(submitError.message || 'Unable to complete this action.');
    } finally {
      setBusy(false);
    }
  }

  const hasInput = dialog.inputType === 'textarea' || dialog.inputType === 'text';
  return (
    <Modal
      open
      title={dialog.title}
      onClose={() => !busy && onClose()}
      footer={<>
        <button type="button" className="btn btn-g" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="button" className={`btn ${dialog.danger ? 'btn-red' : 'btn-p'}`} onClick={submit} disabled={busy}>
          {busy ? 'Please wait…' : dialog.confirmLabel || 'Continue'}
        </button>
      </>}
    >
      <form onSubmit={submit}>
        {dialog.message && <p style={{ margin: '0 0 14px', color: 'var(--t3)', fontSize: 13, lineHeight: 1.6 }}>{dialog.message}</p>}
        {hasInput && (dialog.inputType === 'textarea'
          ? <textarea
            className="field"
            autoFocus
            rows={4}
            maxLength={dialog.maxLength || 2000}
            placeholder={dialog.placeholder}
            value={value}
            onChange={event => { setValue(event.target.value); setError(''); }}
          />
          : <input
            className="field"
            autoFocus
            maxLength={dialog.maxLength || 200}
            placeholder={dialog.placeholder}
            value={value}
            onChange={event => { setValue(event.target.value); setError(''); }}
          />)}
        {error && <div role="alert" style={{ marginTop: 8, color: 'var(--red)', fontSize: 12 }}>{error}</div>}
      </form>
    </Modal>
  );
}
