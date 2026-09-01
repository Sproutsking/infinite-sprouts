import supabase from '../lib/supabaseClient.js';

/**
 * LABOR MARKETPLACE SERVICE
 * Handles worker services, labor contracts, and skill-based matching
 */

export async function createLaborService(workerData) {
  const { data, error } = await supabase.from('labor_services').insert({
    worker_id: workerData.worker_id,
    service_name: workerData.service_name,
    description: workerData.description,
    service_type: workerData.service_type,
    team_size: workerData.team_size || 1,
    daily_rate: workerData.daily_rate,
    minimum_duration_days: workerData.minimum_duration_days || 1,
    state: workerData.state,
    lga: workerData.lga,
    skills: workerData.skills || [],
    years_experience: workerData.years_experience,
    certifications: workerData.certifications,
    available_from: workerData.available_from,
    available_to: workerData.available_to,
  }).select('*').single();
  
  if (error) throw error;
  return data;
}

export async function updateLaborService(serviceId, updates) {
  const { data, error } = await supabase
    .from('labor_services')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', serviceId)
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

export async function getLaborService(serviceId) {
  const { data, error } = await supabase
    .from('labor_services')
    .select(`
      *,
      profiles:worker_id (
        id, full_name, avatar_url, rating, review_count, years_experience
      )
    `)
    .eq('id', serviceId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function searchLaborServices(query, state = null, serviceType = null, limit = 50) {
  let queryBuilder = supabase
    .from('labor_services')
    .select(`
      *,
      profiles:worker_id (
        id, full_name, avatar_url, rating, review_count
      )
    `)
    .eq('status', 'active');
  
  if (state) {
    queryBuilder = queryBuilder.eq('state', state);
  }
  
  if (serviceType) {
    queryBuilder = queryBuilder.eq('service_type', serviceType);
  }
  
  if (query) {
    queryBuilder = queryBuilder.or(`service_name.ilike.%${query}%,description.ilike.%${query}%`);
  }
  
  const { data, error } = await queryBuilder
    .order('rating', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function getWorkerServices(workerId) {
  const { data, error } = await supabase
    .from('labor_services')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createLaborContract(contractData) {
  // Calculate total contract value
  const daysNeeded = Math.ceil((new Date(contractData.end_date) - new Date(contractData.start_date)) / (1000 * 60 * 60 * 24));
  const totalValue = contractData.daily_rate * daysNeeded;
  
  const { data, error } = await supabase.from('labor_contracts').insert({
    service_id: contractData.service_id,
    farmer_id: contractData.farmer_id,
    worker_id: contractData.worker_id,
    contract_name: contractData.contract_name,
    description: contractData.description,
    daily_rate: contractData.daily_rate,
    start_date: contractData.start_date,
    end_date: contractData.end_date,
    estimated_days: daysNeeded,
    total_contract_value: totalValue,
    payment_per_day: contractData.daily_rate,
  }).select('*').single();
  
  if (error) throw error;
  return data;
}

export async function getLaborContract(contractId) {
  const { data, error } = await supabase
    .from('labor_contracts')
    .select(`
      *,
      labor_services:service_id (
        service_name, service_type
      ),
      farmer:farmer_id (
        id, full_name, avatar_url, rating
      ),
      worker:worker_id (
        id, full_name, avatar_url, rating
      )
    `)
    .eq('id', contractId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getFarmerContracts(farmerId) {
  const { data, error } = await supabase
    .from('labor_contracts')
    .select(`
      *,
      labor_services:service_id (
        service_name, service_type
      ),
      worker:worker_id (
        id, full_name, avatar_url, rating, review_count
      )
    `)
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getWorkerContracts(workerId) {
  const { data, error } = await supabase
    .from('labor_contracts')
    .select(`
      *,
      labor_services:service_id (
        service_name, service_type
      ),
      farmer:farmer_id (
        id, full_name, avatar_url, rating, review_count
      )
    `)
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function updateContractStatus(contractId, status) {
  const { data, error } = await supabase
    .from('labor_contracts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', contractId)
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateContractDaysCompleted(contractId, daysCompleted) {
  const contract = await getLaborContract(contractId);
  const totalPaid = daysCompleted * contract.payment_per_day;
  
  const updates = {
    days_completed: daysCompleted,
    payment_status: daysCompleted >= contract.estimated_days ? 'completed' : 'partial',
    updated_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('labor_contracts')
    .update(updates)
    .eq('id', contractId)
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

export async function rateLaborContract(contractId, raterType, rating, review) {
  const contract = await getLaborContract(contractId);
  const updates = {};
  
  if (raterType === 'farmer') {
    updates.farmer_rating = rating;
    updates.farmer_review = review;
  } else if (raterType === 'worker') {
    updates.worker_rating = rating;
    updates.worker_review = review;
  }
  
  const { data, error } = await supabase
    .from('labor_contracts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', contractId)
    .select('*')
    .single();
  
  if (error) throw error;
  
  // Update profile rating
  const targetUserId = raterType === 'farmer' ? contract.worker_id : contract.farmer_id;
  await updateWorkerProfileRating(targetUserId);
  
  return data;
}

async function updateWorkerProfileRating(userId) {
  const { data: ratings, error } = await supabase
    .from('labor_contracts')
    .select('farmer_rating, worker_rating')
    .or(`farmer_id.eq.${userId},worker_id.eq.${userId}`)
    .or(`farmer_rating.is.not.null,worker_rating.is.not.null`);
  
  if (!error && ratings && ratings.length > 0) {
    let totalRating = 0;
    let count = 0;
    
    ratings.forEach(r => {
      if (r.farmer_rating) { totalRating += r.farmer_rating; count++; }
      if (r.worker_rating) { totalRating += r.worker_rating; count++; }
    });
    
    if (count > 0) {
      const avgRating = totalRating / count;
      await supabase
        .from('profiles')
        .update({ rating: parseFloat(avgRating.toFixed(1)), review_count: count })
        .eq('id', userId);
    }
  }
}

export async function matchWorkersForFarm(farmId, skillsNeeded, state) {
  const { data, error } = await supabase
    .from('labor_services')
    .select(`
      *,
      profiles:worker_id (
        id, full_name, avatar_url, rating, review_count
      )
    `)
    .eq('status', 'active')
    .eq('state', state)
    .order('rating', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  
  // Score workers based on skill match
  return (data || []).map(worker => {
    const matchedSkills = (worker.skills || []).filter(s => skillsNeeded.includes(s));
    return {
      ...worker,
      matchScore: (matchedSkills.length / skillsNeeded.length) * 100 + (worker.rating || 0),
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export default {
  createLaborService,
  updateLaborService,
  getLaborService,
  searchLaborServices,
  getWorkerServices,
  createLaborContract,
  getLaborContract,
  getFarmerContracts,
  getWorkerContracts,
  updateContractStatus,
  updateContractDaysCompleted,
  rateLaborContract,
  matchWorkersForFarm,
};
