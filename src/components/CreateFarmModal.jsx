import React, { useEffect, useState } from 'react';
import I from '../icons/icons.jsx';
import Modal from './Modal.jsx';
import ProgBar from './ProgBar.jsx';
import { fmt } from '../utils/helpers.js';
import farmService from '../services/farmService.js';
import { useAuth } from '../context/AuthContext.jsx';

function CreateFarmModal({ open, onClose, onSuccess, showToast, farm = null }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const defaultMilestones = [
    { title: 'Land preparation and inputs', description: '', release_percent: '25', due_date: '' },
    { title: 'Planting and crop establishment', description: '', release_percent: '35', due_date: '' },
    { title: 'Crop care and field monitoring', description: '', release_percent: '25', due_date: '' },
    { title: 'Harvest and sales evidence', description: '', release_percent: '15', due_date: '' },
  ];
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
    funding_deadline: '',
    return_share_percent: '',
    risk_disclosure: '',
    use_of_funds: '',
  });
  const [milestones, setMilestones] = useState(defaultMilestones);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError('');
    setFormData(farm ? {
      name: farm.name || '',
      description: farm.description || '',
      state: farm.state || '',
      lga: farm.lga || '',
      crop_type: farm.crop_type || '',
      farm_size_hectares: farm.farm_size_hectares ?? '',
      goal_amount: farm.goal_amount ?? '',
      total_shares: String(farm.total_shares || 1000),
      timeline_months: farm.timeline_months ?? '',
      expected_roi: farm.expected_roi ?? '',
      start_date: farm.start_date || '',
      harvest_date: farm.harvest_date || '',
      funding_deadline: farm.funding_deadline || '',
      return_share_percent: farm.return_share_percent ?? '',
      risk_disclosure: farm.risk_disclosure || '',
      use_of_funds: farm.use_of_funds || '',
    } : {
      name: '', description: '', state: '', lga: '', crop_type: '',
      farm_size_hectares: '', goal_amount: '', total_shares: '1000',
      timeline_months: '', expected_roi: '', start_date: '', harvest_date: '',
      funding_deadline: '', return_share_percent: '',
      risk_disclosure: '', use_of_funds: '',
    });
    let cancelled = false;
    if (farm) {
      farmService.getFarmMilestones(farm.id)
        .then(items => {
          if (!cancelled) setMilestones(items.map(({ title, description, release_percent, due_date }) => ({
            title, description, release_percent: String(release_percent), due_date,
          })));
        })
        .catch(loadError => {
          console.error('Unable to load campaign milestones:', loadError);
          if (!cancelled) setError('Unable to load this campaign schedule. Please try again.');
        });
    } else {
      setMilestones(defaultMilestones);
    }
    return () => { cancelled = true; };
  }, [open, farm]);

  const states = ['Abia', 'Adamawa', 'Akwa Ibom', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];
  const cropTypes = ['Maize', 'Rice', 'Cassava', 'Tomato', 'Pepper', 'Onion', 'Yam', 'Beans', 'Soybean', 'Wheat', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const updateMilestone = (index, field, value) => {
    setMilestones(current => current.map((milestone, i) => i === index ? { ...milestone, [field]: value } : milestone));
    setError('');
  };

  const pricePerShare = Number(formData.goal_amount) > 0 && Number(formData.total_shares) > 0
    ? (Number(formData.goal_amount) / Number(formData.total_shares)).toFixed(2)
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
      if (!Number.isFinite(Number(formData.goal_amount)) || Number(formData.goal_amount) <= 0) return 'Goal must be a positive number';
      if (!Number.isInteger(Number(formData.total_shares)) || Number(formData.total_shares) <= 0) return 'Total shares must be a positive whole number';
      if (!Number.isInteger(Number(formData.timeline_months)) || Number(formData.timeline_months) <= 0) return 'Timeline must be a positive whole number';
      if (!Number.isFinite(Number(formData.return_share_percent)) || Number(formData.return_share_percent) <= 0 || Number(formData.return_share_percent) > 100) return 'Harvest proceeds share must be between 0 and 100%';
      if (!formData.use_of_funds.trim()) return 'Explain how the campaign funds will be used';
      if (!formData.risk_disclosure.trim()) return 'Disclose the main risks for this campaign';
    } else if (currentStep === 4) {
      if (!formData.start_date) return 'Start date is required';
      if (!formData.harvest_date) return 'Harvest date is required';
      if (formData.harvest_date <= formData.start_date) return 'Harvest date must be after the start date';
      if (!formData.funding_deadline) return 'Funding deadline is required';
      if (formData.funding_deadline >= formData.start_date) return 'Funding deadline must be before the season starts';
      if (milestones.length < 1) return 'Add at least one funding milestone';
      if (milestones.some(item => !item.title.trim() || !item.due_date || item.due_date < formData.start_date || item.due_date > formData.harvest_date)) return 'Every milestone needs a title and a date within the farming season';
      const releaseTotal = milestones.reduce((sum, item) => sum + Number(item.release_percent || 0), 0);
      if (milestones.some(item => !Number.isFinite(Number(item.release_percent)) || Number(item.release_percent) <= 0) || Math.abs(releaseTotal - 100) > 0.0001) return 'Milestone release percentages must total 100%';
      if (formData.expected_roi && (!Number.isFinite(Number(formData.expected_roi)) || Number(formData.expected_roi) < 0)) return 'Forecast must be a non-negative number';
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
        location: `${formData.lga.trim()}, ${formData.state}`,
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
        expected_roi: formData.expected_roi ? parseFloat(formData.expected_roi) : 0,
        funding_deadline: formData.funding_deadline,
        return_share_percent: parseFloat(formData.return_share_percent),
        payout_asset: 'ist',
        risk_disclosure: formData.risk_disclosure.trim(),
        use_of_funds: formData.use_of_funds.trim(),
        project_image: '🌾',
        milestones: milestones.map(item => ({
          ...item,
          title: item.title.trim(),
          description: item.description.trim(),
          release_percent: Number(item.release_percent),
        })),
      };

      const result = farm
        ? await farmService.updateFarmProject(farm.id, farmData)
        : await farmService.createFarmProject(farmData);
      showToast('ok', farm ? `Draft campaign "${formData.name}" updated.` : `Campaign "${formData.name}" saved as a draft.`);
      onSuccess?.(result);
      
      // Reset
      setStep(1);
      setFormData({
        name: '', description: '', state: '', lga: '', crop_type: '',
        farm_size_hectares: '', goal_amount: '', total_shares: '1000',
        timeline_months: '', expected_roi: '', start_date: '', harvest_date: '',
        funding_deadline: '', return_share_percent: '',
        risk_disclosure: '', use_of_funds: '',
      });
      setMilestones(defaultMilestones);
      setError('');
      onClose();
    } catch (err) {
      console.error(farm ? 'Error updating farm campaign:' : 'Error creating farm campaign:', err);
      setError(err.message || 'Failed to create farm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={farm ? 'Edit Farm Project' : 'Create Farm Project for Investment'} wide
      footer={
        <>
          <button className="btn btn-g" onClick={() => { if (step > 1) setStep(step - 1); else onClose(); }}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button className="btn btn-p" onClick={step === 4 ? handleSubmit : handleNext} disabled={loading}>
            {loading ? (farm ? 'Saving...' : 'Creating...') : step === 4 ? (farm ? 'Save Changes' : 'Save campaign draft') : 'Next →'}
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

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Total campaign shares *</label>
              <input className="field" type="number" name="total_shares" value={formData.total_shares} onChange={handleChange} min="1" step="1" />
            </div>
            <div className="form-g">
              <label className="label">Investor pool share of gross verified harvest sales (%) *</label>
              <input className="field" type="number" name="return_share_percent" value={formData.return_share_percent} onChange={handleChange} min="0.01" max="100" step="0.01" placeholder="e.g., 35" />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Payout asset</label>
              <div className="field" aria-describedby="payout-asset-note" style={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>IST (Cardano)</div>
            </div>
            <div className="form-g">
              <label className="label">Estimated share price</label>
              <div className="field" style={{ display: 'flex', alignItems: 'center', fontWeight: 800 }}>{fmt(pricePerShare)} IST</div>
            </div>
          </div>
          <div id="payout-asset-note" className="notice ni" style={{ marginBottom: 12 }}>
            <I.Info/><span>IST payout is the selected product direction. Harvest sales are reported in Naira, so a transparent NGN-to-IST conversion rule is still required. Settlement remains disabled until that rule, IST deployment, and an audited Cardano escrow are in place.</span>
          </div>

          <div style={{ background: 'var(--sf3)', border: '1px solid var(--bd)', borderRadius: 'var(--r12)', padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Share Structure</div>
            <div className="flex-pair">
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

          <div className="form-g" style={{ marginBottom: 12 }}>
            <label className="label">How will the funds be used? *</label>
            <textarea className="field" name="use_of_funds" value={formData.use_of_funds} onChange={handleChange} placeholder="Explain the planned inputs, labor, equipment, and operating costs." style={{ minHeight: 70, resize: 'vertical' }} />
          </div>
          <div className="form-g">
            <label className="label">Campaign risks investors should consider *</label>
            <textarea className="field" name="risk_disclosure" value={formData.risk_disclosure} onChange={handleChange} placeholder="Include relevant weather, pest, price, logistics, and production risks. Returns are not guaranteed." style={{ minHeight: 70, resize: 'vertical' }} />
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>⚠️ {error}</div>}
        </div>
      )}

      {/* Step 4: Timeline & ROI */}
      {step === 4 && (
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--t4)', fontWeight: 700, marginBottom: 20 }}>Step 4 of 4 — Season & funding milestones</div>
          
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

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g">
              <label className="label">Funding deadline *</label>
              <input className="field" type="date" name="funding_deadline" value={formData.funding_deadline} onChange={handleChange} />
            </div>
            <div className="form-g">
              <label className="label">Illustrative return scenario (%)</label>
              <input className="field" type="number" name="expected_roi" placeholder="Optional forecast only" value={formData.expected_roi} onChange={handleChange} min="0" step="1" />
            </div>
          </div>

          <div style={{ background: 'var(--sf3)', border: '1px solid var(--bd)', borderRadius: 'var(--r12)', padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Staged fund releases</div>
            <div style={{ fontSize: 11, color: 'var(--t4)', marginBottom: 12 }}>Define evidence-based milestones. Their release percentages must total 100% of the campaign budget.</div>
            {milestones.map((milestone, index) => (
              <div key={index} className="form-row" style={{ marginBottom: 10 }}>
                <div className="form-g">
                  <label className="label">Milestone {index + 1}</label>
                  <input className="field" value={milestone.title} onChange={event => updateMilestone(index, 'title', event.target.value)} placeholder="Milestone name" />
                  <input className="field" style={{ marginTop: 6 }} value={milestone.description} onChange={event => updateMilestone(index, 'description', event.target.value)} placeholder="Evidence or deliverable to report" />
                </div>
                <div className="form-g">
                  <label className="label">Release % and due date</label>
                  <input className="field" type="number" min="0.01" max="100" step="0.01" value={milestone.release_percent} onChange={event => updateMilestone(index, 'release_percent', event.target.value)} />
                  <input className="field" style={{ marginTop: 6 }} type="date" value={milestone.due_date} onChange={event => updateMilestone(index, 'due_date', event.target.value)} />
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: Math.abs(milestones.reduce((sum, item) => sum + Number(item.release_percent || 0), 0) - 100) < 0.0001 ? 'var(--ac)' : 'var(--red)' }}>
              Allocated: {milestones.reduce((sum, item) => sum + Number(item.release_percent || 0), 0)}%
            </div>
          </div>

          <div style={{ background: 'var(--gold-l)', border: '1px solid var(--gold-b)', borderRadius: 'var(--r12)', padding: 12, color: 'var(--t2)', fontSize: 12 }}>
            Forecasts are estimates, not promises. Investors receive the campaign’s disclosed share of actual realized harvest proceeds, subject to the risks above. Funds are planned for staged release after platform milestone review; live on-chain escrow is not yet available.
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
