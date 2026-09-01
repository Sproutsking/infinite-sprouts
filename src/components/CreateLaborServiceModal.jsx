import React, { useState } from 'react';
import I from '../icons/icons.jsx';
import Modal from './Modal.jsx';
import { fmt } from '../utils/helpers.js';
import laborService from '../services/laborService.js';
import { useAuth } from '../context/AuthContext.jsx';

function CreateLaborServiceModal({ open, onClose, onSuccess, showToast }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    service_type: '',
    team_size: '1',
    daily_rate: '',
    minimum_duration_days: '1',
    state: '',
    lga: '',
    skills: '',
    years_experience: '',
    certifications: '',
    available_from: '',
    available_to: '',
  });

  const states = ['Abia', 'Adamawa', 'Akwa Ibom', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];
  const serviceTypes = ['Planting', 'Weeding', 'Harvesting', 'Land Preparation', 'Pest Control', 'Fertilizing', 'Irrigation', 'General Farm Work', 'Livestock Care', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!formData.service_name.trim()) return 'Service name is required';
    if (!formData.service_type) return 'Service type is required';
    if (!formData.daily_rate) return 'Daily rate is required';
    if (isNaN(formData.daily_rate) || formData.daily_rate <= 0) return 'Daily rate must be a positive number';
    if (!formData.state) return 'State is required';
    if (!formData.lga.trim()) return 'LGA is required';
    if (isNaN(formData.team_size) || formData.team_size <= 0) return 'Team size must be positive';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        worker_id: user.id,
        service_name: formData.service_name,
        description: formData.description,
        service_type: formData.service_type,
        team_size: parseInt(formData.team_size),
        daily_rate: parseFloat(formData.daily_rate),
        minimum_duration_days: parseInt(formData.minimum_duration_days) || 1,
        state: formData.state,
        lga: formData.lga,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        certifications: formData.certifications,
        available_from: formData.available_from,
        available_to: formData.available_to,
      };

      const result = await laborService.createLaborService(serviceData);
      showToast('ok', `"${formData.service_name}" service listed successfully!`);
      onSuccess?.(result);
      
      // Reset
      setFormData({
        service_name: '', description: '', service_type: '', team_size: '1',
        daily_rate: '', minimum_duration_days: '1', state: '', lga: '',
        skills: '', years_experience: '', certifications: '',
        available_from: '', available_to: '',
      });
      setError('');
      onClose();
    } catch (err) {
      console.error('Error listing service:', err);
      setError(err.message || 'Failed to list service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Offer Your Labor Services" wide sheet
      footer={
        <>
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Listing...' : 'List Service'}
          </button>
        </>
      }>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Service Name *</label>
            <input className="field" type="text" name="service_name" placeholder="e.g., Planting Crew" value={formData.service_name} onChange={handleChange} />
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Service Type *</label>
              <select className="field" name="service_type" value={formData.service_type} onChange={handleChange}>
                <option value="">Select type</option>
                {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-g">
              <label className="label">Team Size *</label>
              <input className="field" type="number" name="team_size" placeholder="1" value={formData.team_size} onChange={handleChange} min="1" />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Daily Rate (IST) *</label>
              <input className="field" type="number" name="daily_rate" placeholder="0" value={formData.daily_rate} onChange={handleChange} step="100" min="0" />
            </div>
            <div className="form-g">
              <label className="label">Minimum Duration (days)</label>
              <input className="field" type="number" name="minimum_duration_days" placeholder="1" value={formData.minimum_duration_days} onChange={handleChange} min="1" />
            </div>
          </div>

          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Description</label>
            <textarea className="field" name="description" placeholder="Describe your services and experience..." value={formData.description} onChange={handleChange} style={{ minHeight: 80, resize: 'vertical' }} />
          </div>
        </div>

        <div>
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

          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Skills (comma-separated)</label>
            <input className="field" type="text" name="skills" placeholder="e.g., Planting, Weeding, Pest Control" value={formData.skills} onChange={handleChange} />
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Years of Experience</label>
              <input className="field" type="number" name="years_experience" placeholder="0" value={formData.years_experience} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Certifications (optional)</label>
            <input className="field" type="text" name="certifications" placeholder="e.g., Pesticide Handling Cert" value={formData.certifications} onChange={handleChange} />
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Available From</label>
              <input className="field" type="date" name="available_from" value={formData.available_from} onChange={handleChange} />
            </div>
            <div className="form-g">
              <label className="label">Available Until</label>
              <input className="field" type="date" name="available_to" value={formData.available_to} onChange={handleChange} />
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--sf3)', border: '1px solid var(--bd)', borderRadius: 'var(--r12)', padding: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Service Summary</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span>Daily Rate</span>
              <span style={{ fontWeight: 700, color: 'var(--ac)' }}>{fmt(formData.daily_rate)} IST/day</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span>Team Size</span>
              <span style={{ fontWeight: 700 }}>{formData.team_size} workers</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>Per Team Day</span>
              <span style={{ fontWeight: 700, color: 'var(--ac)' }}>{fmt(parseInt(formData.daily_rate) * parseInt(formData.team_size))} IST</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 16 }}>⚠️ {error}</div>}
    </Modal>
  );
}

export default CreateLaborServiceModal;
