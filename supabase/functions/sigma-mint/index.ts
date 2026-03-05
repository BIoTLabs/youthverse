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

    const callerUserId = claimsData.claims.sub;

    // Check admin role
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: roleData } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUserId)
      .in('role', ['admin', 'national_admin']);

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: corsHeaders });
    }

    const { userId, amount, referenceId, txType } = await req.json();
    if (!userId || !amount) {
      return new Response(JSON.stringify({ error: 'userId and amount required' }), { status: 400, headers: corsHeaders });
    }

    const deployerKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');
    if (!deployerKey) {
      return new Response(JSON.stringify({ error: 'DEPLOYER_PRIVATE_KEY not configured' }), { status: 500, headers: corsHeaders });
    }

    // Get contract address
    const { data: configData } = await serviceClient
      .from('platform_config')
      .select('value')
      .eq('key', 'sigma_contract_address')
      .single();

    if (!configData?.value) {
      // If no contract deployed yet, return null txHash (tokens tracked in DB only)
      console.warn('No Sigma contract deployed yet. Skipping on-chain mint.');
      return new Response(JSON.stringify({ 
        success: true, 
        txHash: null,
        message: 'No contract deployed. DB-only tracking.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get user's wallet address
    const { data: walletData } = await serviceClient
      .from('custodial_wallets')
      .select('address')
      .eq('user_id', userId)
      .single();

    if (!walletData?.address) {
      console.warn('User has no custodial wallet. Skipping on-chain mint.');
      return new Response(JSON.stringify({ 
        success: true, 
        txHash: null,
        message: 'User has no wallet. DB-only tracking.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { ethers } = await import("npm:ethers@6.13.0");

    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const deployer = new ethers.Wallet(deployerKey, provider);

    const contractAbi = [
      "function mint(address to, uint256 amount)",
      "function balanceOf(address) view returns (uint256)",
    ];

    const contract = new ethers.Contract(configData.value, contractAbi, deployer);

    // Mint tokens (amount in wei, 18 decimals)
    const mintAmount = ethers.parseUnits(String(amount), 18);
    const tx = await contract.mint(walletData.address, mintAmount);
    const receipt = await tx.wait();

    console.log(`Minted ${amount} SIGMA to ${walletData.address}, tx: ${receipt.hash}`);

    return new Response(JSON.stringify({ 
      success: true, 
      txHash: receipt.hash,
      to: walletData.address,
      amount,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Mint error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
