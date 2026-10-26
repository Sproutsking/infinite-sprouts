import supabase from '../lib/supabaseClient.js';
import { inclusiveCalendarDays, normalizeLaborService } from '../models/marketplaceModel.js';

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
    .select('*')
    .eq('id', serviceId)
    .single();
  
  if (error) throw error;
  return normalizeLaborService(data);
}

export async function searchLaborServices(query, state = null, serviceType = null, limit = 50) {
  let queryBuilder = supabase
    .from('labor_services')
    .select('*')
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
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []).map(normalizeLaborService);
}

export async function getWorkerServices(workerId) {
  const { data, error } = await supabase
    .from('labor_services')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []).map(normalizeLaborService);
}

export async function createLaborContract(contractData) {
  inclusiveCalendarDays(contractData.start_date, contractData.end_date);
  const { data, error } = await supabase.rpc('request_labor_contract', {
    p_service_id: contractData.service_id,
    p_start_date: contractData.start_date,
    p_end_date: contractData.end_date,
    p_contract_name: contractData.contract_name || null,
    p_description: contractData.description || null,
  });
  if (error) throw error;
  return data;
}

export async function getLaborContract(contractId) {
  const { data, error } = await supabase
    .from('labor_contracts')
    .select('*, labor_services:service_id(service_name, service_type)')
    .eq('id', contractId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getFarmerContracts(farmerId) {
  const { data, error } = await supabase
    .from('labor_contracts')
    .select('*, labor_services:service_id(service_name, service_type)')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getWorkerContracts(workerId) {
  const { data, error } = await supabase
    .from('labor_contracts')
    .select('*, labor_services:service_id(service_name, service_type)')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function updateContractStatus(contractId, status) {
  const { data, error } = await supabase.rpc('respond_to_labor_contract', {
    p_contract_id: contractId,
    p_decision: status,
  });
  if (error) throw error;
  return data;
}

export async function reportLaborWorkday(contractId, daysReported) {
  const { data, error } = await supabase.rpc('report_labor_workdays', {
    p_contract_id: contractId,
    p_days_reported: daysReported,
  });
  if (error) throw error;
  return data;
}

export async function confirmLaborWorkday(contractId, daysCompleted) {
  const { data, error } = await supabase.rpc('confirm_labor_workdays', {
    p_contract_id: contractId,
    p_days_completed: daysCompleted,
  });
  if (error) throw error;
  return data;
}

export async function rateLaborContract(contractId, raterType, rating, review) {
  if (!['farmer', 'worker'].includes(raterType)) throw new Error('Invalid labor contract reviewer.');
  const { data, error } = await supabase.rpc('rate_labor_contract', {
    p_contract_id: contractId,
    p_rating: rating,
    p_review: review || null,
  });
  if (error) throw error;
  return data;
}

export async function matchWorkersForFarm(farmId, skillsNeeded, state) {
  const { data, error } = await supabase
    .from('labor_services')
    .eq('status', 'active')
    .eq('state', state)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  
  // Score workers based on skill match
  return (data || []).map(worker => {
    const matchedSkills = (worker.skills || []).filter(s => skillsNeeded.includes(s));
    return {
      ...normalizeLaborService(worker),
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
  reportLaborWorkday,
  confirmLaborWorkday,
  rateLaborContract,
  matchWorkersForFarm,
};
