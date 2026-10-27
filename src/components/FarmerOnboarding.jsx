import React, { useState } from 'react';
import I from '../icons/icons.jsx';
import Modal from './Modal.jsx';
import { useProfile } from '../context/ProfileContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import nigeriaLocations from 'nigeria-state-lga-data';

function FarmerOnboarding({ open, onClose, onSuccess }) {
  const { setupFarmerProfile, loading } = useProfile();
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    state: '',
    lga: '',
    farmSize: '',
    cropsGrown: '',
    bio: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const states = nigeriaLocations.getStates();
  const localGovernmentAreas = data.state ? nigeriaLocations.getLgas(data.state) : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => name === 'state'
      ? { ...prev, state: value, lga: '' }
      : { ...prev, [name]: value });
    setError('');
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!data.state) {
        setError('Please select your state');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!data.phone) {
        setError('Please enter your phone number');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!data.farmSize || !Number.isFinite(Number(data.farmSize)) || Number(data.farmSize) <= 0) {
        setError('Please enter a valid farm size greater than zero.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      try {
        await setupFarmerProfile({
          state: data.state,
          lga: data.lga || '',
          farm_size_hectares: data.farmSize,
          crops_grown: data.cropsGrown || '',
          bio: data.bio || `Farmer in ${data.state} growing ${data.cropsGrown}`,
          phone: data.phone,
        });
        setSuccess(true);
        setTimeout(() => {
          onClose();
          onSuccess?.();
          setSuccess(false);
          setStep(1);
          setData({ state: '', lga: '', farmSize: '', cropsGrown: '', bio: '', phone: '' });
        }, 2000);
      } catch (err) {
        setError(err.message || 'Setup failed. Please try again.');
      }
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={success ? "Welcome, Farmer! 🌾" : "Set Up Your Farmer Profile"} lg
      footer={!success ? (
        <>
          <button className="btn btn-g" onClick={() => { if (step > 1) setStep(step - 1); else onClose(); }}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button className="btn btn-p" onClick={handleNext} disabled={loading}>
            {loading ? 'Setting up...' : step === 4 ? 'Complete Setup' : 'Next'}
          </button>
        </>
      ) : null}>
      
      {success ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--ac)', marginBottom: 8 }}>Profile Created!</div>
          <div style={{ color: 'var(--t4)', fontSize: 14 }}>You can now list farms, sell produce, and hire workers.</div>
        </div>
      ) : (
        <>
          {/* Step 1: Location */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--t4)', fontWeight: 700, marginBottom: 20 }}>Step 1 of 4 — Location</div>
              <div className="form-g" style={{ marginBottom: 16 }}>
                <label className="label">State *</label>
                <select className="field" name="state" value={data.state} onChange={handleChange} style={{ padding: '10px 12px' }}>
                  <option value="">Select your state</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-g">
                <label className="label">LGA (optional)</label>
                <select className="field" name="lga" value={data.lga} onChange={handleChange} disabled={!data.state} style={{ padding: '10px 12px' }}>
                  <option value="">{data.state ? 'Select your local government area' : 'Select a state first'}</option>
                  {localGovernmentAreas.map(lga => <option key={lga} value={lga}>{lga}</option>)}
                </select>
              </div>
              {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>{error}</div>}
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--t4)', fontWeight: 700, marginBottom: 20 }}>Step 2 of 4 — Contact Information</div>
              <div className="form-g" style={{ marginBottom: 16 }}>
                <label className="label">Phone Number *</label>
                <input className="field" type="tel" name="phone" placeholder="e.g., +2348012345678" value={data.phone} onChange={handleChange} />
              </div>
              <div style={{ background: 'var(--sf3)', border: '1px solid var(--bd)', borderRadius: 'var(--r12)', padding: 12, fontSize: 12, color: 'var(--t4)' }}>
                ℹ️ We'll use this to connect you with buyers and workers.
              </div>
              {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>{error}</div>}
            </div>
          )}

          {/* Step 3: Farm Details */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--t4)', fontWeight: 700, marginBottom: 20 }}>Step 3 of 4 — Farm Details</div>
              <div className="form-g" style={{ marginBottom: 16 }}>
                <label className="label">Farm Size (hectares) *</label>
                <input className="field" type="number" name="farmSize" placeholder="e.g., 5" value={data.farmSize} onChange={handleChange} />
              </div>
              <div className="form-g">
                <label className="label">Crops You Grow (optional)</label>
                <input className="field" type="text" name="cropsGrown" placeholder="e.g., Maize, Cassava, Tomato" value={data.cropsGrown} onChange={handleChange} />
              </div>
              {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>{error}</div>}
            </div>
          )}

          {/* Step 4: Bio */}
          {step === 4 && (
            <div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--t4)', fontWeight: 700, marginBottom: 20 }}>Step 4 of 4 — About You</div>
              <div className="form-g">
                <label className="label">Bio (optional)</label>
                <textarea className="field" name="bio" placeholder="Tell buyers and workers about yourself..." value={data.bio} onChange={handleChange} style={{ minHeight: 100, padding: '10px 12px', resize: 'vertical' }} />
              </div>
              <div style={{ background: 'var(--sf3)', border: '1px solid var(--bd)', borderRadius: 'var(--r12)', padding: 12, fontSize: 12, color: 'var(--t4)', marginTop: 16 }}>
                ✅ After setup, you can list farms for investment, sell produce, and hire workers.
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div style={{ display: 'flex', gap: 4, marginTop: 24 }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                height: 4,
                flex: 1,
                borderRadius: 2,
                background: step >= s ? 'var(--ac)' : 'var(--bd)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}

export default FarmerOnboarding;
