import { SupabaseDatabase } from '../services/supabaseDatabase';

const updateDatabaseSchema = async () => {
  try {
    console.log('🔄 بدء تحديث قاعدة البيانات...');
    
    const supabase = new SupabaseDatabase();
    
    // Get the Supabase client directly
    const client = (supabase as any).supabase;
    
    // Add attachment_urls columns
    const queries = [
      'ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS attachment_urls TEXT;',
      'ALTER TABLE public.revenues ADD COLUMN IF NOT EXISTS attachment_urls TEXT;',
      'ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS attachment_urls TEXT;'
    ];
    
    for (const query of queries) {
      console.log(`⚡ تنفي��: ${query}`);
      const { error } = await client.rpc('execute_sql', { sql: query });
      if (error) {
        console.error('❌ خطأ في تنفيذ SQL:', error);
      } else {
        console.log('✅ تم بنجاح');
      }
    }
    
    // Check if columns were added successfully
    const { data, error } = await client
      .from('information_schema.columns')
      .select('column_name, table_name, data_type')
      .in('table_name', ['expenses', 'revenues', 'withdrawals'])
      .eq('column_name', 'attachment_urls');
    
    if (error) {
      console.error('❌ خطأ في فحص الأعمدة:', error);
    } else {
      console.log('📊 الأعمدة المضافة:');
      console.table(data);
    }
    
    console.log('🎉 تم تحديث قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
};

// Run the update
updateDatabaseSchema();
