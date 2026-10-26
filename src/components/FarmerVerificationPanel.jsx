import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import farmService from '../services/farmService.js';

export default function FarmerVerificationPanel({ showToast, onStatusChange }) {
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [certificationType, setCertificationType] = useState('government_farmer_registration');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadRequest() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const latest = await farmService.getFarmerVerificationRequest(user.id);
        if (!cancelled) {
          setRequest(latest);
          onStatusChange?.(latest?.status || null);
        }
      } catch (loadError) {
        console.error('Farmer verification status load error:', loadError);
        if (!cancelled) showToast('error', 'Unable to load farmer verification status.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRequest();
    return () => { cancelled = true; };
  }, [user?.id, showToast, onStatusChange]);

  async function submit(event) {
    event.preventDefault();
    if (!file || !user?.id) {
      setError('Choose a government-issued certification document.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const created = await farmService.submitFarmerVerification({
        farmerId: user.id,
        certificationType,
        issuingAuthority,
        registrationNumber,
        file,
      });
      setRequest(created);
      onStatusChange?.(created.status);
      setFile(null);
      setRegistrationNumber('');
      showToast('ok', 'Certification submitted for review.');
    } catch (submitError) {
      console.error('Farmer verification submission error:', submitError);
      setError(submitError.message || 'Unable to submit certification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const statusLabel = request?.status === 'approved'
    ? 'Verified'
    : request?.status === 'rejected'
      ? 'Needs attention'
      : request?.status === 'pending'
        ? 'Under review'
        : 'Not submitted';

  return (
    <section style={{ background: 'var(--sf)', border: '1px solid var(--bd2)', borderRadius: 'var(--r16)', padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>Farmer verification</div>
          <div style={{ color: 'var(--t4)', fontSize: 12, marginTop: 4 }}>Submit a government-issued farming or business certificate. Documents are private and only visible to you and authorized platform reviewers.</div>
        </div>
        <span className="badge" style={{ flexShrink: 0 }}>{loading ? 'Loading' : statusLabel}</span>
      </div>

      {request?.reviewer_notes && (
        <div style={{ background: 'var(--sf3)', borderRadius: 'var(--r10)', padding: 11, color: 'var(--t2)', fontSize: 12, margin: '12px 0' }}>
          Reviewer note: {request.reviewer_notes}
        </div>
      )}

      {!loading && request?.status !== 'approved' && request?.status !== 'pending' && (
        <form onSubmit={submit} style={{ marginTop: 14 }}>
          <div className="form-row" style={{ marginBottom: 10 }}>
            <div className="form-g">
              <label className="label" htmlFor="farmer-cert-type">Certification type</label>
              <select id="farmer-cert-type" className="field" value={certificationType} onChange={event => setCertificationType(event.target.value)}>
                <option value="government_farmer_registration">Government farmer registration</option>
                <option value="cooperative_registration">Registered agricultural cooperative</option>
                <option value="business_registration">Business registration</option>
                <option value="land_use_document">Land-use or farm title document</option>
                <option value="other_government_certificate">Other government certificate</option>
              </select>
            </div>
            <div className="form-g">
              <label className="label" htmlFor="farmer-cert-authority">Issuing authority</label>
              <input id="farmer-cert-authority" className="field" value={issuingAuthority} onChange={event => setIssuingAuthority(event.target.value)} required maxLength={160} placeholder="Ministry, agency, cooperative registry…" />
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: 10 }}>
            <div className="form-g">
              <label className="label" htmlFor="farmer-cert-number">Certificate / registration number</label>
              <input id="farmer-cert-number" className="field" value={registrationNumber} onChange={event => setRegistrationNumber(event.target.value)} required maxLength={120} autoComplete="off" />
            </div>
            <div className="form-g">
              <label className="label" htmlFor="farmer-cert-file">Document (PDF, JPEG, PNG; max 10 MB)</label>
              <input id="farmer-cert-file" className="field" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={event => setFile(event.target.files?.[0] || null)} required />
            </div>
          </div>
          {error && <div role="alert" style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{error}</div>}
          <button className="btn btn-p" type="submit" disabled={submitting || loading}>
            {submitting ? 'Submitting securely…' : request?.status === 'rejected' ? 'Resubmit certification' : 'Submit for verification'}
          </button>
        </form>
      )}

      {request?.status === 'pending' && (
        <div style={{ color: 'var(--t3)', fontSize: 12, marginTop: 12 }}>Your submission is awaiting manual document review. Campaigns remain unavailable to investors until verification is approved.</div>
      )}
      {request?.status === 'approved' && (
        <div style={{ color: 'var(--ac)', fontSize: 12, marginTop: 12 }}>Your farmer certification has been reviewed and approved.</div>
      )}
    </section>
  );
}
