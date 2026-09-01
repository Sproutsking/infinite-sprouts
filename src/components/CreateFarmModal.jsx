import React, { useState } from 'react';
import I from '../icons/icons.jsx';
import { Modal, ProgBar } from '../index.jsx';
import { fmt } from '../utils/helpers.js';
import farmService from '../services/farmService.js';
import { useAuth } from '../context/AuthContext.jsx';

function CreateFarmModal({ open, onClose, onSuccess, showToast }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    state: '',
    lga: '',
    crop_type: '',
    farm_size_hectares: '',
    goal_amount: '',
    total_shares: '1000',
    timeline_months: '',
    expected_roi: '',
    start_date: '',
    harvest_date: '',
  });

  const states = ['Abia', 'Adamawa', 'Akwa Ibom', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];
  const cropTypes = ['Maize', 'Rice', 'Cassava', 'Tomato', 'Pepper', 'Onion', 'Yam', 'Beans', 'Soybean', 'Wheat', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const pricePerShare = formData.goal_amount && formData.total_shares 
    ? (parseInt(formData.goal_amount) / parseInt(formData.total_shares)).toFixed(2)
    : 0;

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.name.trim()) return 'Farm name is required';
      if (!formData.state) return 'State is required';
      if (!formData.lga.trim()) return 'LGA is required';
    } else if (currentStep === 2) {
      if (!formData.crop_type) return 'Crop type is required';
      if (!formData.farm_size_hectares) return 'Farm size is required';
      if (isNaN(formData.farm_size_hectares) || formData.farm_size_hectares <= 0) return 'Farm size must be a positive number';
    } else if (currentStep === 3) {
      if (!formData.goal_amount) return 'Funding goal is required';
      if (!formData.timeline_months) return 'Timeline is required';
      if (isNaN(formData.goal_amount) || formData.goal_amount <= 0) return 'Goal must be a positive number';
      if (isNaN(formData.timeline_months) || formData.timeline_months <= 0) return 'Timeline must be a positive number';
    } else if (currentStep === 4) {
      if (!formData.start_date) return 'Start date is required';
      if (!formData.harvest_date) return 'Harvest date is required';
      if (!formData.expected_roi) return 'Expected ROI is required';
      if (isNaN(formData.expected_roi)) return 'ROI must be a number';
    }
    return '';
  };

  const handleNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateStep(4);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const farmData = {
        owner_id: user.id,
        name: formData.name,
        description: formData.description,
        state: formData.state,
        lga: formData.lga,
        crop_type: formData.crop_type,
        farm_size_hectares: parseFloat(formData.farm_size_hectares),
        goal_amount: parseFloat(formData.goal_amount),
        total_shares: parseInt(formData.total_shares),
        price_per_share: parseFloat(pricePerShare),
        start_date: formData.start_date,
        harvest_date: formData.harvest_date,
        timeline_months: parseInt(formData.timeline_months),
        expected_roi: parseFloat(formData.expected_roi),
        project_image: '🌾',
      };

      const result = await farmService.createFarmProject(farmData);
      showToast('ok', `Farm "${formData.name}" created successfully!`);
      onSuccess?.(result);
      
      // Reset
      setStep(1);
      setFormData({
        name: '', description: '', state: '', lga: '', crop_type: '',
        farm_size_hectares: '', goal_amount: '', total_shares: '1000',
        timeline_months: '', expected_roi: '', start_date: '', harvest_date: '',
      });
      setError('');
      onClose();
    } catch (err) {
      console.error('Error creating farm:', err);
      setError(err.message || 'Failed to create farm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Create Farm Project for Investment" wide sheet
      footer={
        <>
          <button className="btn btn-g" onClick={() => { if (step > 1) setStep(step - 1); else onClose(); }}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button className="btn btn-p" onClick={step === 4 ? handleSubmit : handleNext} disabled={loading}>
            {loading ? 'Creating...' : step === 4 ? 'Create Farm' : 'Next →'}
          </button>
        </>
      }>
      
      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--t4)', fontWeight: 700, marginBottom: 20 }}>Step 1 of 4 — Farm Basics</div>
          
          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Farm Name *</label>
            <input className="field" type="text" name="name" placeholder="e.g., Bright Haven Farm" value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Description</label>
            <textarea className="field" name="description" placeholder="Describe your farm..." value={formData.description} onChange={handleChange} style={{ minHeight: 80, resize: 'vertical' }} />
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">State *</label>
              <select className="field" name="state" value={formData.state} onChange={handleChange}>
                <option value="">Select state</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-g">
              <label className="label">LGA *</label>
              <input className="field" type="text" name="lga" placeholder="e.g., Ibadan" value={formData.lga} onChange={handleChange} />
            </div>
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>⚠️ {error}</div>}
        </div>
      )}

      {/* Step 2: Farm Details */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--t4)', fontWeight: 700, marginBottom: 20 }}>Step 2 of 4 — Farm Details</div>
          
          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Crop Type *</label>
            <select className="field" name="crop_type" value={formData.crop_type} onChange={handleChange}>
              <option value="">Select crop</option>
              {cropTypes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-g">
            <label className="label">Farm Size (hectares) *</label>
            <input className="field" type="number" name="farm_size_hectares" placeholder="e.g., 5" value={formData.farm_size_hectares} onChange={handleChange} min="0.1" step="0.1" />
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>⚠️ {error}</div>}
        </div>
      )}

      {/* Step 3: Investment Goal */}
      {step === 3 && (
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--t4)', fontWeight: 700, marginBottom: 20 }}>Step 3 of 4 — Investment Goal</div>
          
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Funding Goal (IST) *</label>
              <input className="field" type="number" name="goal_amount" placeholder="e.g., 50000" value={formData.goal_amount} onChange={handleChange} min="1000" step="1000" />
            </div>
            <div className="form-g">
              <label className="label">Timeline (months) *</label>
              <input className="field" type="number" name="timeline_months" placeholder="e.g., 6" value={formData.timeline_months} onChange={handleChange} min="1" max="36" />
            </div>
          </div>

          <div style={{ background: 'var(--sf3)', border: '1px solid var(--bd)', borderRadius: 'var(--r12)', padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Share Structure</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--t4)' }}>Total Shares</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{formData.total_shares}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--t4)' }}>Price per Share</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ac)' }}>{fmt(pricePerShare)} IST</div>
              </div>
            </div>
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>⚠️ {error}</div>}
        </div>
      )}

      {/* Step 4: Timeline & ROI */}
      {step === 4 && (
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--t4)', fontWeight: 700, marginBottom: 20 }}>Step 4 of 4 — Timeline & ROI</div>
          
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Start Date *</label>
              <input className="field" type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
            </div>
            <div className="form-g">
              <label className="label">Harvest Date *</label>
              <input className="field" type="date" name="harvest_date" value={formData.harvest_date} onChange={handleChange} />
            </div>
          </div>

          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Expected ROI (%) *</label>
            <input className="field" type="number" name="expected_roi" placeholder="e.g., 25" value={formData.expected_roi} onChange={handleChange} min="0" max="200" step="1" />
          </div>

          <div style={{ background: 'var(--g900)', borderRadius: 'var(--r12)', padding: 12, color: '#fff' }}>
            <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 8 }}>PROJECTED RETURNS</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--fd)' }}>
              +{fmt(parseInt(formData.goal_amount) * (parseFloat(formData.expected_roi) || 0) / 100)} IST
            </div>
            <div style={{ fontSize: 10, opacity: 0.8, marginTop: 8 }}>
              Investors will receive ~{formData.expected_roi}% return if target achieved
            </div>
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>⚠️ {error}</div>}
        </div>
      )}

      {/* Progress */}
      <div style={{ display: 'flex', gap: 4, marginTop: 24 }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{
            height: 4,
            flex: 1,
            borderRadius: 2,
            background: step >= s ? 'var(--ac)' : 'var(--bd)',
          }} />
        ))}
      </div>
    </Modal>
  );
}

export default CreateFarmModal;
