import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { userId } = await req.json();
    const targetUserId = userId || claimsData.claims.sub;

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if wallet already exists
    const { data: existing } = await serviceClient
      .from('custodial_wallets')
      .select('address')
      .eq('user_id', targetUserId)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ 
        success: true, 
        address: existing.address,
        existing: true,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const encryptionKey = Deno.env.get('WALLET_ENCRYPTION_KEY');
    if (!encryptionKey) {
      return new Response(JSON.stringify({ error: 'WALLET_ENCRYPTION_KEY not configured' }), { status: 500, headers: corsHeaders });
    }

    const { ethers } = await import("npm:ethers@6.13.0");

    // Generate a new random wallet
    const wallet = ethers.Wallet.createRandom();
    const privateKey = wallet.privateKey;
    const address = wallet.address;

    // Encrypt private key using AES-GCM
    const encoder = new TextEncoder();
    const keyBytes = new Uint8Array(encryptionKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, cryptoKey, encoder.encode(privateKey)
    );

    // Store as hex: iv + ciphertext
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const ctHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');
    const encryptedPrivateKey = ivHex + ':' + ctHex;

    // Store in DB
    const { error: insertErr } = await serviceClient.from('custodial_wallets').insert({
      user_id: targetUserId,
      address,
      encrypted_private_key: encryptedPrivateKey,
    });

    if (insertErr) {
      console.error('Wallet insert error:', insertErr);
      return new Response(JSON.stringify({ error: insertErr.message }), { status: 500, headers: corsHeaders });
    }

    // Also update profile with wallet address
    await serviceClient.from('profiles').update({ wallet_address: address }).eq('user_id', targetUserId);

    console.log(`Created custodial wallet for ${targetUserId}: ${address}`);

    return new Response(JSON.stringify({ 
      success: true, 
      address,
      existing: false,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Wallet creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
