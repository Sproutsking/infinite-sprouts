import supabase from '../lib/supabaseClient.js';

/**
 * PRODUCE MARKETPLACE SERVICE
 * Handles produce listings, orders, and transactions
 */

export async function createProduceListing(sellerData) {
  const { data, error } = await supabase.from('produce_listings').insert({
    seller_id: sellerData.seller_id,
    name: sellerData.name,
    description: sellerData.description,
    produce_type: sellerData.produce_type,
    price_per_unit: sellerData.price_per_unit,
    unit: sellerData.unit,
    quantity_available: sellerData.quantity_available,
    state: sellerData.state,
    lga: sellerData.lga,
    location_details: sellerData.location_details,
    image_url: sellerData.image_url,
    certification: sellerData.certification,
    quality_condition: sellerData.quality_condition || 'unspecified',
    can_deliver: sellerData.can_deliver || false,
    delivery_radius_km: sellerData.delivery_radius_km,
    expiry_date: sellerData.expiry_date || null,
  }).select('*').single();
  
  if (error) throw error;
  return data;
}

export async function updateProduceListing(listingId, updates) {
  const { data, error } = await supabase
    .from('produce_listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', listingId)
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

export async function getProduceListing(listingId) {
  const { data, error } = await supabase
    .from('produce_listings')
    .select('*')
    .eq('id', listingId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function searchProduce(query, state = null, limit = 50) {
  let queryBuilder = supabase
    .from('produce_listings')
    .select('*')
    .eq('status', 'active');
  
  if (state) {
    queryBuilder = queryBuilder.eq('state', state);
  }
  
  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,produce_type.ilike.%${query}%,description.ilike.%${query}%`);
  }
  
  const { data, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function getSellerListings(sellerId) {
  const { data, error } = await supabase
    .from('produce_listings')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createProduceOrder(orderData) {
  const { data, error } = await supabase.from('produce_orders').insert({
    listing_id: orderData.listing_id,
    buyer_id: orderData.buyer_id,
    seller_id: orderData.seller_id,
    quantity_ordered: orderData.quantity_ordered,
    unit_price: orderData.unit_price,
    total_amount: orderData.total_amount,
    delivery_address: orderData.delivery_address,
    estimated_delivery: orderData.estimated_delivery,
  }).select('*').single();
  
  if (error) throw error;
  
  // Update listing quantity
  const listing = await getProduceListing(orderData.listing_id);
  const newQty = listing.quantity_available - orderData.quantity_ordered;
  await updateProduceListing(orderData.listing_id, {
    quantity_sold: listing.quantity_sold + orderData.quantity_ordered,
    quantity_available: Math.max(0, newQty),
    status: newQty <= 0 ? 'sold_out' : 'active',
  });
  
  return data;
}

export async function getProduceOrder(orderId) {
  const { data, error } = await supabase
    .from('produce_orders')
    .select(`
      *,
      produce_listings:listing_id (
        name, produce_type, image_url, unit
      )
    `)
    .eq('id', orderId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getBuyerOrders(buyerId) {
  const { data, error } = await supabase
    .from('produce_orders')
    .select(`
      *,
      produce_listings:listing_id (
        name, produce_type, image_url
      )
    `)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getSellerOrders(sellerId) {
  const { data, error } = await supabase
    .from('produce_orders')
    .select(`
      *,
      produce_listings:listing_id (
        name, produce_type
      )
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(orderId, orderStatus, paymentStatus = null) {
  const updates = { order_status: orderStatus, updated_at: new Date().toISOString() };
  if (paymentStatus) updates.payment_status = paymentStatus;
  
  const { data, error } = await supabase
    .from('produce_orders')
    .update(updates)
    .eq('id', orderId)
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

export async function rateProduceOrder(orderId, raterType, rating, review) {
  const order = await getProduceOrder(orderId);
  const updates = {};
  
  if (raterType === 'buyer') {
    updates.buyer_rating = rating;
    updates.buyer_review = review;
  } else if (raterType === 'seller') {
    updates.seller_rating = rating;
    updates.seller_review = review;
  }
  
  const { data, error } = await supabase
    .from('produce_orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('*')
    .single();
  
  if (error) throw error;
  
  // Update profile rating (recalculate average)
  const targetUserId = raterType === 'buyer' ? order.seller_id : order.buyer_id;
  await updateProfileRating(targetUserId, raterType);
  
  return data;
}

async function updateProfileRating(userId, raterType) {
  const { data: ratings, error } = await supabase
    .from('produce_orders')
    .select(raterType === 'buyer' ? 'seller_rating' : 'buyer_rating')
    .eq(raterType === 'buyer' ? 'seller_id' : 'buyer_id', userId)
    .not(raterType === 'buyer' ? 'seller_rating' : 'buyer_rating', 'is', null);
  
  if (error) throw error;
  if (ratings?.length) {
    const avgRating = ratings.reduce((sum, r) => sum + (raterType === 'buyer' ? r.seller_rating : r.buyer_rating), 0) / ratings.length;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ rating: parseFloat(avgRating.toFixed(1)), review_count: ratings.length })
      .eq('id', userId);
    if (updateError) throw updateError;
  }
}

export default {
  createProduceListing,
  updateProduceListing,
  getProduceListing,
  searchProduce,
  getSellerListings,
  createProduceOrder,
  getProduceOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
  rateProduceOrder,
};
