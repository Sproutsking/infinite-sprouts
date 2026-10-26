import supabase from '../lib/supabaseClient.js';

/**
 * FARM PROJECTS SERVICE
 * Handles farm project creation, management, and investment tracking
 */

export async function createFarmProject(farmerData) {
  const { milestones, ...campaign } = farmerData;
  const { data, error } = await supabase.rpc('create_farm_campaign', {
    p_campaign: campaign,
    p_milestones: milestones,
  });
  
  if (error) throw error;
  return data;
}

export async function updateFarmProject(farmId, updates) {
  if (updates.status) {
    const { data, error } = await supabase
      .from('farm_projects')
      .update({ status: updates.status, updated_at: new Date().toISOString() })
      .eq('id', farmId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  const { milestones, ...campaign } = updates;
  const { data, error } = await supabase.rpc('update_draft_farm_campaign', {
    p_farm_id: farmId,
    p_campaign: campaign,
    p_milestones: milestones,
  });
  if (error) throw error;
  return data;
}

export async function getFarmMilestones(farmId) {
  const { data, error } = await supabase
    .from('farm_project_milestones')
    .select('*')
    .eq('farm_id', farmId)
    .order('sequence', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function getFarmerVerificationRequest(farmerId) {
  const { data, error } = await supabase
    .from('farmer_verification_requests')
    .select('id, certification_type, issuing_authority, status, reviewer_notes, created_at')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function isFarmReviewer() {
  const { data, error } = await supabase.rpc('has_farm_reviewer_role');
  if (error) throw error;
  return data === true;
}

export async function getFarmReviewQueue() {
  const [verificationResult, campaignResult, milestoneResult] = await Promise.all([
    supabase
      .from('farmer_verification_requests')
      .select('id, farmer_id, certification_type, issuing_authority, registration_number, document_path, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('farm_projects')
      .select('id, owner_id, name, description, location, state, lga, crop_type, farm_size_hectares, goal_amount, total_shares, price_per_share, start_date, harvest_date, timeline_months, return_share_percent, payout_asset, risk_disclosure, use_of_funds, funding_deadline, status, verification_status, created_at')
      .eq('status', 'active')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('farm_project_milestones')
      .select('id, farm_id, sequence, title, description, farmer_update, evidence_urls, updated_at, farm_projects(name, owner_id)')
      .eq('status', 'submitted')
      .order('updated_at', { ascending: true }),
  ]);

  if (verificationResult.error) throw verificationResult.error;
  if (campaignResult.error) throw campaignResult.error;
  if (milestoneResult.error) throw milestoneResult.error;
  const campaignIds = (campaignResult.data || []).map(campaign => campaign.id);
  let milestones = [];
  if (campaignIds.length) {
    const { data, error } = await supabase
      .from('farm_project_milestones')
      .select('id, farm_id, sequence, title, description, release_percent, due_date')
      .in('farm_id', campaignIds)
      .order('sequence', { ascending: true });
    if (error) throw error;
    milestones = data || [];
  }
  return {
    verifications: verificationResult.data || [],
    milestones: milestoneResult.data || [],
    campaigns: (campaignResult.data || []).map(campaign => ({
      ...campaign,
      milestones: milestones.filter(milestone => milestone.farm_id === campaign.id),
    })),
  };
}

export async function getVerificationDocumentUrl(path) {
  const { data, error } = await supabase.storage
    .from('farmer-verification-documents')
    .createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}

export async function reviewFarmerVerification(requestId, decision, reviewerNotes = '') {
  const { data, error } = await supabase.rpc('review_farmer_verification', {
    p_request_id: requestId,
    p_decision: decision,
    p_reviewer_notes: reviewerNotes,
  });
  if (error) throw error;
  return data;
}

export async function reviewFarmCampaign(farmId, decision, reviewerNotes = '') {
  const { data, error } = await supabase.rpc('review_farm_campaign', {
    p_farm_id: farmId,
    p_decision: decision,
    p_reviewer_notes: reviewerNotes,
  });
  if (error) throw error;
  return data;
}

export async function reviewFarmMilestone(milestoneId, decision, reviewerNotes = '') {
  const { data, error } = await supabase.rpc('review_farm_project_milestone', {
    p_milestone_id: milestoneId,
    p_decision: decision,
    p_reviewer_notes: reviewerNotes,
  });
  if (error) throw error;
  return data;
}

export async function getLatestFarmCampaignReview(farmId) {
  const { data, error } = await supabase
    .from('farm_campaign_reviews')
    .select('decision, reviewer_notes, created_at')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitFarmerVerification({ farmerId, certificationType, issuingAuthority, registrationNumber, file }) {
  const allowedTypes = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
  };
  if (!allowedTypes[file?.type]) throw new Error('Upload a PDF, JPEG, or PNG certification document.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Certification documents must be 10 MB or smaller.');
  if (!certificationType?.trim() || !issuingAuthority?.trim() || !registrationNumber?.trim()) {
    throw new Error('Complete all certification details before submitting.');
  }

  const path = `${farmerId}/${crypto.randomUUID()}.${allowedTypes[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from('farmer-verification-documents')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('farmer_verification_requests')
    .insert({
      farmer_id: farmerId,
      certification_type: certificationType.trim(),
      issuing_authority: issuingAuthority.trim(),
      registration_number: registrationNumber.trim(),
      document_path: path,
      status: 'pending',
    })
    .select('id, certification_type, issuing_authority, status, reviewer_notes, created_at')
    .single();

  if (error) {
    const { error: cleanupError } = await supabase.storage
      .from('farmer-verification-documents')
      .remove([path]);
    if (cleanupError) console.error('Unable to remove unlinked verification document:', cleanupError);
    throw error;
  }
  return data;
}

export async function submitFarmMilestone({ farmId, milestoneId, farmerId, update, file }) {
  const allowedTypes = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
  };
  if (!update?.trim() || update.trim().length < 20) {
    throw new Error('Provide a progress update of at least 20 characters.');
  }
  if (!allowedTypes[file?.type]) throw new Error('Upload a PDF, JPEG, or PNG evidence file.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Evidence files must be 10 MB or smaller.');

  const path = `${farmerId}/campaigns/${farmId}/milestones/${milestoneId}/${crypto.randomUUID()}.${allowedTypes[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from('farmer-verification-documents')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('farm_project_milestones')
    .update({
      status: 'submitted',
      farmer_update: update.trim(),
      evidence_urls: [path],
      updated_at: new Date().toISOString(),
    })
    .eq('id', milestoneId)
    .eq('farm_id', farmId)
    .in('status', ['planned', 'rejected'])
    .select('*')
    .single();

  if (error) {
    const { error: cleanupError } = await supabase.storage
      .from('farmer-verification-documents')
      .remove([path]);
    if (cleanupError) console.error('Unable to remove unlinked milestone evidence:', cleanupError);
    throw error;
  }
  return data;
}

export async function getFarmProject(farmId) {
  const { data, error } = await supabase
    .from('farm_projects')
    .select('*')
    .eq('id', farmId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function fetchFarmsByState(state, limit = 20) {
  const { data, error } = await supabase
    .from('farm_projects')
    .select('*')
    .eq('state', state)
    .eq('status', 'active')
    .eq('verification_status', 'verified')
    .gt('return_share_percent', 0)
    .neq('risk_disclosure', '')
    .neq('use_of_funds', '')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function fetchAllFarms(limit = 50) {
  const { data, error } = await supabase
    .from('farm_projects')
    .select('*')
    .eq('status', 'active')
    .eq('verification_status', 'verified')
    .gt('return_share_percent', 0)
    .neq('risk_disclosure', '')
    .neq('use_of_funds', '')
    .order('funded_amount', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function fetchFarmerProjects(farmerId) {
  const { data, error } = await supabase
    .from('farm_projects')
    .select('*')
    .eq('owner_id', farmerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function investInFarm(farmId, investorId, shares, amount) {
  void farmId;
  void investorId;
  void shares;
  void amount;
  throw new Error('On-chain investing is unavailable until IST and the Cardano escrow contract are deployed.');
}

export async function getInvestorShares(investorId) {
  const { data, error } = await supabase
    .from('farm_investments')
    .select(`
      *,
      farm_projects:farm_id (
        id, name, location, icon, expected_roi, harvest_date, status
      )
    `)
    .eq('investor_id', investorId)
    .eq('status', 'active');
  
  if (error) throw error;
  return data || [];
}

export async function getFarmInvestors(farmId) {
  const { data, error } = await supabase
    .from('farm_investments')
    .select(`
      *,
      profiles:investor_id (
        id, full_name, avatar_url, initials
      )
    `)
    .eq('farm_id', farmId);
  
  if (error) throw error;
  return data || [];
}

export async function distributePayout(farmId, harvestAmount) {
  void farmId;
  void harvestAmount;
  throw new Error('Harvest distributions require verified proceeds and a deployed payout integration.');
}

export default {
  createFarmProject,
  updateFarmProject,
  getFarmProject,
  getFarmMilestones,
  getFarmerVerificationRequest,
  isFarmReviewer,
  getFarmReviewQueue,
  getVerificationDocumentUrl,
  reviewFarmerVerification,
  reviewFarmCampaign,
  reviewFarmMilestone,
  getLatestFarmCampaignReview,
  submitFarmerVerification,
  submitFarmMilestone,
  fetchFarmsByState,
  fetchAllFarms,
  fetchFarmerProjects,
  investInFarm,
  getInvestorShares,
  getFarmInvestors,
  distributePayout,
};
