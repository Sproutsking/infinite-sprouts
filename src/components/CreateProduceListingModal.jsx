import React, { useState } from 'react';
import I from '../icons/icons.jsx';
import { Modal } from '../index.jsx';
import { fmt } from '../utils/helpers.js';
import produceService from '../services/produceService.js';
import { useAuth } from '../context/AuthContext.jsx';

function CreateProduceListingModal({ open, onClose, onSuccess, showToast }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    produce_type: '',
    price_per_unit: '',
    unit: 'kg',
    quantity_available: '',
    state: '',
    lga: '',
    location_details: '',
    certification: '',
    can_deliver: false,
    delivery_radius_km: '10',
    expiry_date: '',
  });

  const states = ['Abia', 'Adamawa', 'Akwa Ibom', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];
  const produceTypes = ['Maize', 'Rice', 'Cassava', 'Tomato', 'Pepper', 'Onion', 'Yam', 'Beans', 'Leafy Greens', 'Cucumber', 'Cabbage', 'Carrot', 'Lettuce', 'Other'];
  const units = ['kg', 'bag', 'basket', 'box', 'piece', 'crate'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Produce name is required';
    if (!formData.produce_type) return 'Produce type is required';
    if (!formData.price_per_unit) return 'Price is required';
    if (isNaN(formData.price_per_unit) || formData.price_per_unit <= 0) return 'Price must be a positive number';
    if (!formData.quantity_available) return 'Quantity is required';
    if (isNaN(formData.quantity_available) || formData.quantity_available <= 0) return 'Quantity must be a positive number';
    if (!formData.state) return 'State is required';
    if (!formData.lga.trim()) return 'LGA is required';
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
      const produceData = {
        seller_id: user.id,
        name: formData.name,
        description: formData.description,
        produce_type: formData.produce_type,
        price_per_unit: parseFloat(formData.price_per_unit),
        unit: formData.unit,
        quantity_available: parseFloat(formData.quantity_available),
        state: formData.state,
        lga: formData.lga,
        location_details: formData.location_details,
        certification: formData.certification,
        can_deliver: formData.can_deliver,
        delivery_radius_km: formData.can_deliver ? parseInt(formData.delivery_radius_km) : null,
        expiry_date: formData.expiry_date,
        image_url: '🌿',
      };

      const result = await produceService.createProduceListing(produceData);
      showToast('ok', `"${formData.name}" listed successfully!`);
      onSuccess?.(result);
      
      // Reset
      setFormData({
        name: '', description: '', produce_type: '', price_per_unit: '',
        unit: 'kg', quantity_available: '', state: '', lga: '',
        location_details: '', certification: '', can_deliver: false,
        delivery_radius_km: '10', expiry_date: '',
      });
      setError('');
      onClose();
    } catch (err) {
      console.error('Error listing produce:', err);
      setError(err.message || 'Failed to list produce. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const totalValue = formData.price_per_unit && formData.quantity_available
    ? (parseFloat(formData.price_per_unit) * parseFloat(formData.quantity_available)).toFixed(2)
    : 0;

  return (
    <Modal open={open} onClose={onClose} title="List Produce for Sale" wide sheet
      footer={
        <>
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Listing...' : 'List Produce'}
          </button>
        </>
      }>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Produce Name *</label>
            <input className="field" type="text" name="name" placeholder="e.g., Fresh Tomatoes" value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Produce Type *</label>
              <select className="field" name="produce_type" value={formData.produce_type} onChange={handleChange}>
                <option value="">Select type</option>
                {produceTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-g">
              <label className="label">Unit *</label>
              <select className="field" name="unit" value={formData.unit} onChange={handleChange}>
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Price per {formData.unit} (IST) *</label>
              <input className="field" type="number" name="price_per_unit" placeholder="0" value={formData.price_per_unit} onChange={handleChange} step="0.01" min="0" />
            </div>
            <div className="form-g">
              <label className="label">Quantity *</label>
              <input className="field" type="number" name="quantity_available" placeholder="0" value={formData.quantity_available} onChange={handleChange} step="0.1" min="0" />
            </div>
          </div>

          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Description</label>
            <textarea className="field" name="description" placeholder="Describe your produce..." value={formData.description} onChange={handleChange} style={{ minHeight: 60, resize: 'vertical' }} />
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
            <label className="label">Location Details</label>
            <input className="field" type="text" name="location_details" placeholder="e.g., Mama Adekunle Market" value={formData.location_details} onChange={handleChange} />
          </div>

          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Certification (optional)</label>
            <input className="field" type="text" name="certification" placeholder="e.g., Organic, Fair Trade" value={formData.certification} onChange={handleChange} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" name="can_deliver" checked={formData.can_deliver} onChange={handleChange} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 13, color: 'var(--t1)' }}>I can deliver</span>
            </label>
          </div>

          {formData.can_deliver && (
            <div className="form-g" style={{ marginBottom: 12 }}>
              <label className="label">Delivery Radius (km)</label>
              <input className="field" type="number" name="delivery_radius_km" placeholder="10" value={formData.delivery_radius_km} onChange={handleChange} min="1" />
            </div>
          )}

          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">Listing Expiry (optional)</label>
            <input className="field" type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} />
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--sf3)', border: '1px solid var(--bd)', borderRadius: 'var(--r12)', padding: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Listing Summary</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span>Total Value</span>
              <span style={{ fontWeight: 700, color: 'var(--ac)' }}>{fmt(totalValue)} IST</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>Available</span>
              <span style={{ fontWeight: 700 }}>{formData.quantity_available} {formData.unit}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 16 }}>⚠️ {error}</div>}
    </Modal>
  );
}

export default CreateProduceListingModal;
