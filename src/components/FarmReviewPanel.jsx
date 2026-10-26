import React, { useCallback, useEffect, useState } from 'react';
import farmService from '../services/farmService.js';
import { fmt } from '../utils/helpers.js';

export default function FarmReviewPanel({ showToast }) {
  const [queue, setQueue] = useState({ verifications: [], campaigns: [], milestones: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [notes, setNotes] = useState({});
  const [documentUrls, setDocumentUrls] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setQueue(await farmService.getFarmReviewQueue());
    } catch (error) {
      console.error('Farm review queue load error:', error);
      showToast('error', 'Unable to load the farm review queue.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { refresh(); }, [refresh]);

  async function openDocument(path) {
    try {
      const url = await farmService.getVerificationDocumentUrl(path);
      setDocumentUrls(current => ({ ...current, [path]: url }));
    } catch (error) {
      console.error('Verification document access error:', error);
      showToast('error', 'Unable to open this private review document.');
    }
  }

  async function review(kind, id, decision) {
    const key = `${kind}:${id}`;
    const reviewerNotes = notes[key] || '';
    if (decision === 'rejected' && reviewerNotes.trim().length < 10) {
      showToast('error', 'Add a clear rejection reason of at least 10 characters.');
      return;
    }
    setBusy(key);
    try {
      if (kind === 'farmer') {
        await farmService.reviewFarmerVerification(id, decision, reviewerNotes);
      } else if (kind === 'milestone') {
        await farmService.reviewFarmMilestone(id, decision, reviewerNotes);
      } else {
        await farmService.reviewFarmCampaign(id, decision, reviewerNotes);
      }
      showToast('ok', decision === 'approved'
        ? (kind === 'milestone' ? 'Milestone evidence approved. No funds were released.' : 'Review approved.')
        : 'Review returned with required changes.');
      setNotes(current => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      await refresh();
    } catch (error) {
      console.error('Farm review action error:', error);
      showToast('error', error.message || 'Unable to save this review.');
    } finally {
      setBusy('');
    }
  }

  return (
    <section style={{ padding: '18px 0' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--t1)', fontFamily: 'var(--fd)', fontSize: 20 }}>Farm review queue</h2>
          <p style={{ margin: '5px 0 0', color: 'var(--t4)', fontSize: 12 }}>Private certification, campaign, and milestone reviews. Decisions are authorized and recorded by the database; milestone approval does not release funds.</p>
        </div>
        <button type="button" className="btn btn-g btn-sm" onClick={refresh} disabled={loading}>Refresh</button>
      </header>

      {loading ? <div className="empty"><div className="empty-ico">🛡️</div><div className="empty-t">Loading review queue</div></div> : <>
        <div className="sh" style={{ marginBottom: 10 }}>Farmer certifications · {queue.verifications.length}</div>
        {queue.verifications.length === 0 && <div className="empty"><div className="empty-t">No pending farmer certifications</div></div>}
        {queue.verifications.map(request => {
          const key = `farmer:${request.id}`;
          return (
            <article key={key} style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--r16)', padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--t1)' }}>{request.certification_type.replaceAll('_', ' ')}</div>
                  <div style={{ color: 'var(--t3)', fontSize: 12, marginTop: 4 }}>Farmer ID: {request.farmer_id}</div>
                  <div style={{ color: 'var(--t3)', fontSize: 12 }}>Authority: {request.issuing_authority}</div>
                  <div style={{ color: 'var(--t3)', fontSize: 12 }}>Registration: {request.registration_number}</div>
                  <div style={{ color: 'var(--t4)', fontSize: 11, marginTop: 4 }}>Submitted {new Date(request.created_at).toLocaleString()}</div>
                </div>
                {documentUrls[request.document_path]
                  ? <a className="btn btn-g btn-sm" href={documentUrls[request.document_path]} target="_blank" rel="noopener noreferrer">Open secure document</a>
                  : <button type="button" className="btn btn-g btn-sm" onClick={() => openDocument(request.document_path)}>Generate secure link</button>}
              </div>
              <textarea className="field" aria-label="Farmer review notes" placeholder="Required when rejecting; share clear next steps." value={notes[key] || ''} onChange={event => setNotes(current => ({ ...current, [key]: event.target.value }))} rows={2} style={{ marginTop: 12, resize: 'vertical' }} />
              <div className="item-acts" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn-p btn-sm" disabled={busy === key} onClick={() => review('farmer', request.id, 'approved')}>Approve certification</button>
                <button type="button" className="btn btn-red btn-sm" disabled={busy === key} onClick={() => review('farmer', request.id, 'rejected')}>Reject with reason</button>
              </div>
            </article>
          );
        })}

        <div className="sh" style={{ margin: '22px 0 10px' }}>Milestone evidence · {queue.milestones.length}</div>
        {queue.milestones.length === 0 && <div className="empty"><div className="empty-t">No submitted milestone evidence</div></div>}
        {queue.milestones.map(milestone => {
          const key = `milestone:${milestone.id}`;
          return (
            <article key={key} style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--r16)', padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--t1)' }}>{milestone.farm_projects?.name || `Farm campaign #${milestone.farm_id}`}</div>
                  <div style={{ color: 'var(--t2)', fontSize: 13, marginTop: 4 }}>Milestone {milestone.sequence}: {milestone.title}</div>
                  {milestone.description && <div style={{ color: 'var(--t3)', fontSize: 12, marginTop: 4 }}>{milestone.description}</div>}
                  <div style={{ color: 'var(--t3)', fontSize: 12, marginTop: 8, whiteSpace: 'pre-wrap' }}>{milestone.farmer_update}</div>
                  <div style={{ color: 'var(--t4)', fontSize: 11, marginTop: 5 }}>Farmer ID: {milestone.farm_projects?.owner_id || 'Unavailable'} · Submitted {new Date(milestone.updated_at).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(milestone.evidence_urls || []).map(path => (
                    documentUrls[path]
                      ? <a key={path} className="btn btn-g btn-sm" href={documentUrls[path]} target="_blank" rel="noopener noreferrer">Open secure evidence</a>
                      : <button key={path} type="button" className="btn btn-g btn-sm" onClick={() => openDocument(path)}>Generate secure evidence link</button>
                  ))}
                </div>
              </div>
              <textarea className="field" aria-label="Milestone review notes" placeholder="Required when rejecting; provide clear resubmission steps." value={notes[key] || ''} onChange={event => setNotes(current => ({ ...current, [key]: event.target.value }))} rows={2} style={{ marginTop: 12, resize: 'vertical' }} />
              <div className="item-acts" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn-p btn-sm" disabled={busy === key} onClick={() => review('milestone', milestone.id, 'approved')}>Approve evidence</button>
                <button type="button" className="btn btn-red btn-sm" disabled={busy === key} onClick={() => review('milestone', milestone.id, 'rejected')}>Reject with reason</button>
              </div>
            </article>
          );
        })}

        <div className="sh" style={{ margin: '22px 0 10px' }}>Campaigns · {queue.campaigns.length}</div>
        {queue.campaigns.length === 0 && <div className="empty"><div className="empty-t">No pending campaign approvals</div></div>}
        {queue.campaigns.map(campaign => {
          const key = `campaign:${campaign.id}`;
          return (
            <article key={key} style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--r16)', padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--t1)', fontFamily: 'var(--fd)' }}>{campaign.name}</h3>
                  <div style={{ color: 'var(--t3)', fontSize: 12, marginTop: 4 }}>{[campaign.location, campaign.lga, campaign.state].filter(Boolean).join(', ')} · {campaign.crop_type || 'Crop not specified'}</div>
                  <div style={{ color: 'var(--t3)', fontSize: 12, marginTop: 6 }}>Goal: {fmt(campaign.goal_amount)} IST · {campaign.total_shares} units · {fmt(campaign.price_per_share)} IST/unit</div>
                  <div style={{ color: 'var(--t3)', fontSize: 12 }}>Proceeds share: {campaign.return_share_percent}% · Payout asset: {campaign.payout_asset?.toUpperCase()}</div>
                  <div style={{ color: 'var(--t3)', fontSize: 12 }}>Funding closes: {campaign.funding_deadline} · Season: {campaign.start_date} – {campaign.harvest_date}</div>
                  <div style={{ color: 'var(--t3)', fontSize: 12, marginTop: 8 }}><strong>Use of funds:</strong> {campaign.use_of_funds}</div>
                  <div style={{ color: 'var(--t3)', fontSize: 12, marginTop: 5 }}><strong>Risks:</strong> {campaign.risk_disclosure}</div>
                  {campaign.description && <p style={{ color: 'var(--t3)', fontSize: 12 }}>{campaign.description}</p>}
                  <div style={{ color: 'var(--t2)', fontWeight: 700, fontSize: 12, marginTop: 10 }}>Planned release milestones</div>
                  {(campaign.milestones || []).map(milestone => (
                    <div key={milestone.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) auto auto', gap: 10, borderTop: '1px solid var(--bd)', padding: '7px 0', color: 'var(--t3)', fontSize: 11 }}>
                      <span>{milestone.sequence}. {milestone.title}{milestone.description ? ` — ${milestone.description}` : ''}</span>
                      <span>{milestone.release_percent}%</span>
                      <span>{milestone.due_date}</span>
                    </div>
                  ))}
                  <div style={{ color: 'var(--t4)', fontSize: 11 }}>Farmer ID: {campaign.owner_id}</div>
                </div>
              </div>
              <textarea className="field" aria-label="Campaign review notes" placeholder="Required when returning the campaign for changes." value={notes[key] || ''} onChange={event => setNotes(current => ({ ...current, [key]: event.target.value }))} rows={2} style={{ marginTop: 12, resize: 'vertical' }} />
              <div className="item-acts" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn-p btn-sm" disabled={busy === key} onClick={() => review('campaign', campaign.id, 'approved')}>Approve campaign</button>
                <button type="button" className="btn btn-red btn-sm" disabled={busy === key} onClick={() => review('campaign', campaign.id, 'rejected')}>Return with reason</button>
              </div>
            </article>
          );
        })}
      </>}
    </section>
  );
}
