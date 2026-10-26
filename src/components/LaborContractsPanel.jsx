import React, { useCallback, useEffect, useState } from 'react';
import I from '../icons/icons.jsx';
import laborService from '../services/laborService.js';
import { fmt } from '../utils/helpers.js';

function LaborContractsPanel({ userId, view, showToast }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [ratings, setRatings] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = view === 'worker'
        ? await laborService.getWorkerContracts(userId)
        : await laborService.getFarmerContracts(userId);
      setContracts(rows);
    } catch (error) {
      console.error('Labor contract list error:', error);
      showToast('error', 'Unable to load labor requests.');
    } finally {
      setLoading(false);
    }
  }, [userId, view, showToast]);

  useEffect(() => { refresh(); }, [refresh]);

  async function act(contract, action) {
    setBusyId(contract.id);
    try {
      const updated = action === 'report-day'
        ? await laborService.reportLaborWorkday(contract.id, Number(contract.days_reported || 0) + 1)
        : action === 'confirm-day'
          ? await laborService.confirmLaborWorkday(contract.id, Number(contract.days_completed || 0) + 1)
          : await laborService.updateContractStatus(contract.id, action);
      setContracts(items => items.map(item => item.id === contract.id ? { ...item, ...updated } : item));
      showToast('ok', action === 'accept' ? 'Hire request accepted.' : action === 'report-day' ? 'Workday reported.' : 'Hire request updated.');
    } catch (error) {
      console.error('Labor contract action error:', error);
      showToast('error', error.message || 'Unable to update this labor request.');
    } finally {
      setBusyId(null);
    }
  }

  async function submitRating(contract) {
    const rating = ratings[contract.id]?.rating;
    const review = ratings[contract.id]?.review || '';
    if (!rating) {
      showToast('error', 'Choose a rating from 1 to 5.');
      return;
    }
    setBusyId(contract.id);
    try {
      const updated = await laborService.rateLaborContract(
        contract.id,
        view === 'worker' ? 'worker' : 'farmer',
        Number(rating),
        review,
      );
      setContracts(items => items.map(item => item.id === contract.id ? { ...item, ...updated } : item));
      showToast('ok', 'Your contract rating was saved.');
    } catch (error) {
      console.error('Labor contract rating error:', error);
      showToast('error', error.message || 'Unable to save your rating.');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="empty"><div className="empty-t">Loading labor requests…</div></div>;
  if (!contracts.length) return <div className="empty"><div className="empty-ico">🧑‍🌾</div><div className="empty-t">No labor requests yet</div><div className="empty-s">{view === 'worker' ? 'Requests for your services will appear here.' : 'Requests you send to workers will appear here.'}</div></div>;

  return (
    <div className="labor-contract-list">
      {contracts.map(contract => {
        const ownRating = view === 'worker' ? contract.worker_rating : contract.farmer_rating;
        const serviceName = contract.labor_services?.service_name || contract.contract_name || 'Labor service';
        return (
          <article className="labor-contract-card" key={contract.id}>
            <div className="labor-contract-head">
              <div>
                <div className="community-eyebrow">{view === 'worker' ? 'Hire request' : 'Your hire'}</div>
                <h2>{serviceName}</h2>
              </div>
              <span className={`labor-contract-status status-${contract.status}`}>{contract.status.replaceAll('_', ' ')}</span>
            </div>
            <div className="labor-contract-meta">
              <span>{contract.start_date} – {contract.end_date}</span>
              <span>{contract.estimated_days} days</span>
              <span>{fmt(contract.daily_rate)} IST / day</span>
              <strong>{fmt(contract.total_contract_value)} IST estimated</strong>
            </div>
            {contract.description && <p>{contract.description}</p>}
            <div className="notice ni"><I.Info/><span>Payment is not connected. Reported workdays require farmer confirmation; no funds have been reserved or paid.</span></div>
            {view === 'worker' && contract.status === 'pending' && <div className="labor-contract-actions">
              <button className="btn btn-p btn-sm" disabled={busyId === contract.id} onClick={() => act(contract, 'accept')}><I.Check/>Accept request</button>
              <button className="btn btn-g btn-sm" disabled={busyId === contract.id} onClick={() => act(contract, 'decline')}>Decline</button>
            </div>}
            {view === 'farmer' && contract.status === 'pending' && <div className="labor-contract-actions">
              <button className="btn btn-g btn-sm" disabled={busyId === contract.id} onClick={() => act(contract, 'cancel')}>Cancel request</button>
            </div>}
            {view === 'worker' && ['accepted', 'in_progress'].includes(contract.status) && <div className="labor-contract-actions">
              <span>{contract.days_reported || 0} / {contract.estimated_days} workdays reported</span>
              <button className="btn btn-p btn-sm" disabled={busyId === contract.id || contract.days_reported >= contract.estimated_days} onClick={() => act(contract, 'report-day')}>
                {contract.days_reported >= contract.estimated_days ? 'All days reported' : 'Report one workday'}
              </button>
            </div>}
            {view === 'farmer' && ['accepted', 'in_progress'].includes(contract.status) && <div className="labor-contract-actions">
              <span>{contract.days_completed || 0} confirmed / {contract.days_reported || 0} reported</span>
              <button className="btn btn-p btn-sm" disabled={busyId === contract.id || (contract.days_completed || 0) >= (contract.days_reported || 0)} onClick={() => act(contract, 'confirm-day')}>
                {(contract.days_completed || 0) >= (contract.days_reported || 0) ? 'No workdays to confirm' : 'Confirm one workday'}
              </button>
            </div>}
            {contract.status === 'completed' && (ownRating ? <div className="labor-contract-rating">Your rating: {ownRating}/5</div> : <div className="labor-contract-rating">
              <label>Rate this completed contract
                <select className="field" value={ratings[contract.id]?.rating || ''} onChange={event => setRatings(items => ({ ...items, [contract.id]: { ...items[contract.id], rating: event.target.value } }))}>
                  <option value="">Choose rating</option>
                  {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} / 5</option>)}
                </select>
              </label>
              <textarea className="field" rows="2" maxLength="500" placeholder="Optional review" value={ratings[contract.id]?.review || ''}
                onChange={event => setRatings(items => ({ ...items, [contract.id]: { ...items[contract.id], review: event.target.value } }))}/>
              <button className="btn btn-g btn-sm" disabled={busyId === contract.id} onClick={() => submitRating(contract)}>Submit rating</button>
            </div>)}
          </article>
        );
      })}
    </div>
  );
}

export default LaborContractsPanel;
