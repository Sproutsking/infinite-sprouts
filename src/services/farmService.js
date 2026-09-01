import supabase from '../lib/supabaseClient.js';

/**
 * FARM PROJECTS SERVICE
 * Handles farm project creation, management, and investment tracking
 */

export async function createFarmProject(farmerData) {
  const { data, error } = await supabase.from('farm_projects').insert({
    owner_id: farmerData.owner_id,
    name: farmerData.name,
    description: farmerData.description,
    location: farmerData.location,
    state: farmerData.state,
    lga: farmerData.lga,
    crop_type: farmerData.crop_type,
    farm_size_hectares: farmerData.farm_size_hectares,
    goal_amount: farmerData.goal_amount,
    total_shares: farmerData.total_shares,
    price_per_share: farmerData.price_per_share,
    start_date: farmerData.start_date,
    harvest_date: farmerData.harvest_date,
    timeline_months: farmerData.timeline_months,
    expected_roi: farmerData.expected_roi,
    project_image: farmerData.project_image,
    status: 'active',
    verification_status: 'pending',
  }).select('*').single();
  
  if (error) throw error;
  return data;
}

export async function updateFarmProject(farmId, updates) {
  const { data, error } = await supabase
    .from('farm_projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', farmId)
    .select('*')
    .single();
  
  if (error) throw error;
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
  const { data, error } = await supabase.from('farm_investments').insert({
    farm_id: farmId,
    investor_id: investorId,
    shares_purchased: shares,
    amount_invested: amount,
    certificate_id: `CERT-${farmId}-${investorId}-${Date.now()}`,
  }).select('*').single();
  
  if (error) throw error;
  
  // Update farm funded amount
  const farm = await getFarmProject(farmId);
  await updateFarmProject(farmId, {
    funded_amount: farm.funded_amount + amount,
    sold_shares: farm.sold_shares + shares,
  });
  
  return data;
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
  // Create payout record
  const { data: payout, error: payoutError } = await supabase
    .from('harvest_payouts')
    .insert({
      farm_id: farmId,
      total_harvest_amount: harvestAmount,
      status: 'processing',
    })
    .select('*')
    .single();
  
  if (payoutError) throw payoutError;
  
  // Get all investments for this farm
  const { data: investments, error: investError } = await supabase
    .from('farm_investments')
    .select('*')
    .eq('farm_id', farmId);
  
  if (investError) throw investError;
  
  // Calculate share of each investor
  const farm = await getFarmProject(farmId);
  const distributions = investments.map(inv => ({
    payout_id: payout.id,
    investment_id: inv.id,
    investor_id: inv.investor_id,
    amount_due: (inv.shares_purchased / farm.total_shares) * harvestAmount,
  }));
  
  // Insert distributions
  const { error: distError } = await supabase
    .from('harvest_distributions')
    .insert(distributions);
  
  if (distError) throw distError;
  
  // Mark farm as completed
  await updateFarmProject(farmId, { status: 'completed' });
  
  return { payout, distributions };
}

export default {
  createFarmProject,
  updateFarmProject,
  getFarmProject,
  fetchFarmsByState,
  fetchAllFarms,
  fetchFarmerProjects,
  investInFarm,
  getInvestorShares,
  getFarmInvestors,
  distributePayout,
};
