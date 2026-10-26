import React, { useMemo, useState } from 'react';
import I from '../icons/icons.jsx';
import Modal from './Modal.jsx';
import { fmt } from '../utils/helpers.js';
import { inclusiveCalendarDays } from '../models/marketplaceModel.js';
import laborService from '../services/laborService.js';

function LaborRequestModal({ service, onClose, onSuccess, showToast }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    try { return inclusiveCalendarDays(startDate, endDate); }
    catch { return 0; }
  }, [startDate, endDate]);
  const minimumDays = Number(service?.minimum_duration_days || 1);

  async function submitRequest() {
    if (!service) return;
    try {
      const count = inclusiveCalendarDays(startDate, endDate);
      if (count < minimumDays) {
        setError(`This service requires at least ${minimumDays} days.`);
        return;
      }
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await laborService.createLaborContract({
        service_id: service.id,
        start_date: startDate,
        end_date: endDate,
        contract_name: service.service_name,
        description,
      });
      showToast('ok', 'Hire request sent. Payment is not processed.');
      onSuccess?.();
      onClose();
    } catch (requestError) {
      console.error('Labor request submission error:', requestError);
      setError(requestError.message || 'Unable to send this hire request.');
    } finally {
      setLoading(false);
    }
  }

  if (!service) return null;

  return (
    <Modal open={!!service} onClose={onClose} title="Request to hire" wide
      footer={<>
        <button className="btn btn-g" onClick={onClose}>Cancel</button>
        <button className="btn btn-p" onClick={submitRequest} disabled={loading}>
          <I.Check/>{loading ? 'Sending…' : 'Send hire request'}
        </button>
      </>}>
      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 750, color: 'var(--t1)' }}>{service.service_name}</div>
        <div style={{ color: 'var(--t3)', marginTop: 4 }}>
          {fmt(service.daily_rate)} IST / day · {service.team_size || 1} worker{Number(service.team_size || 1) === 1 ? '' : 's'}
        </div>
        <div style={{ color: 'var(--t4)', marginTop: 3 }}>{[service.lga, service.state].filter(Boolean).join(', ')}</div>
      </div>
      <div className="form-row">
        <div className="form-g">
          <label className="label" htmlFor="labor-start-date">Start date *</label>
          <input id="labor-start-date" className="field" type="date" required min={new Date().toISOString().slice(0, 10)}
            max={service.available_to || undefined} value={startDate} onChange={event => { setStartDate(event.target.value); setError(''); }}/>
        </div>
        <div className="form-g">
          <label className="label" htmlFor="labor-end-date">End date *</label>
          <input id="labor-end-date" className="field" type="date" required min={startDate || new Date().toISOString().slice(0, 10)}
            max={service.available_to || undefined} value={endDate} onChange={event => { setEndDate(event.target.value); setError(''); }}/>
        </div>
      </div>
      <div className="form-g" style={{ marginTop: 12 }}>
        <label className="label" htmlFor="labor-request-details">Work details</label>
        <textarea id="labor-request-details" className="field" rows="3" maxLength="1200" value={description}
          onChange={event => setDescription(event.target.value)} placeholder="Describe the farm, tasks, and any arrangements to discuss."/>
      </div>
      <div className="notice ni" style={{ marginTop: 12 }}>
        <I.Info/><span>{days ? `${days} days · estimated contract value ${fmt(days * Number(service.daily_rate))} IST.` : `Minimum duration: ${minimumDays} day${minimumDays === 1 ? '' : 's'}.`}
          {' '}This sends a request to the worker; it does not reserve funds or process payment.
        </span>
      </div>
      {error && <div role="alert" className="social-action-error" style={{ marginTop: 12 }}>{error}</div>}
    </Modal>
  );
}

export default LaborRequestModal;
