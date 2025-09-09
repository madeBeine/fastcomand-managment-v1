import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jdaqprwsmkkgkzjmkbox.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXFwcndzbWtrZ2t6am1rYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzg2MDMsImV4cCI6MjA2OTMxNDYwM30.1NhbPHzwaFb61dJdT6n0EnsBZ1wlcjvIM8ReGA0q5Ek';

async function clearTestData() {
  console.log('🧹 Starting to clear test data from Supabase...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Clear operations log
    console.log('🗑️ Clearing operations log...');
    await supabase.from('operations_log').delete().neq('id', '');
    
    // Clear withdrawals
    console.log('🗑️ Clearing withdrawals...');
    await supabase.from('withdrawals').delete().neq('id', '');
    
    // Clear revenues
    console.log('🗑️ Clearing revenues...');
    await supabase.from('revenues').delete().neq('id', '');
    
    // Clear expenses
    console.log('🗑️ Clearing expenses...');
    await supabase.from('expenses').delete().neq('id', '');
    
    // Clear investors
    console.log('🗑️ Clearing investors...');
    await supabase.from('investors').delete().neq('id', '');
    
    // Clear test users (keep admin only)
    console.log('🗑️ Clearing test users...');
    await supabase.from('users').delete().neq('role', 'Admin');
    
    console.log('✅ All test data cleared successfully!');
    console.log('🎯 Your Supabase database is now clean and ready for real data.');
    
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
  }
}

// Run the script
clearTestData();
