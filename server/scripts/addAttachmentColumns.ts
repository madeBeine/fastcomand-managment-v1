import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

async function addAttachmentColumns() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Supabase credentials not found');
    return false;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    console.log('🔄 Adding attachment columns to Supabase tables...');

    // Add columns using SQL
    const queries = [
      'ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS attachment_urls TEXT;',
      'ALTER TABLE public.revenues ADD COLUMN IF NOT EXISTS attachment_urls TEXT;',
      'ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS attachment_urls TEXT;'
    ];

    for (const query of queries) {
      console.log(`⚡ Executing: ${query}`);
      
      // Use raw SQL through the RPC function
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      
      if (error) {
        // If RPC doesn't work, try direct SQL
        console.log('⚠️ RPC failed, trying alternative method...');
        const { error: altError } = await supabase.from('information_schema.columns').select('*').limit(1);
        if (altError) {
          console.error(`❌ Cannot execute SQL: ${error.message}`);
          console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
          console.log(query);
        }
      } else {
        console.log('✅ Success');
      }
    }

    // Verify columns were added
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name')
      .eq('column_name', 'attachment_urls')
      .in('table_name', ['expenses', 'revenues', 'withdrawals']);

    if (data && data.length > 0) {
      console.log('✅ Verified attachment columns:');
      data.forEach(col => console.log(`  - ${col.table_name}.${col.column_name}`));
      return true;
    } else {
      console.log('⚠️ Could not verify columns. Please check manually.');
      return false;
    }

  } catch (error) {
    console.error('❌ Error adding attachment columns:', error);
    return false;
  }
}

export { addAttachmentColumns };
