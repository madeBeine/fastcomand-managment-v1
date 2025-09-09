import { RealGoogleSheetsServiceV2 } from '../services/realGoogleSheetsV2';

async function testAndPopulate() {
  console.log('🚀 Starting automated test and population...');
  
  const spreadsheetId = '1qU6wQ7KN3LoU_1atvbxSDLshYXZZ_DixgCBDcAcTfJA';
  
  try {
    // Create service instance
    const service = new RealGoogleSheetsServiceV2(spreadsheetId);
    
    // Test connection first
    console.log('🔍 Testing connection...');
    const testResult = await service.testConnection();
    
    if (!testResult.success) {
      console.error('❌ Connection test failed:', testResult.message);
      return {
        success: false,
        message: `فشل الاتصال: ${testResult.message}`
      };
    }
    
    console.log('✅ Connection test passed!');
    
    // Populate with data
    console.log('📊 Adding data to sheets...');
    const populateResult = await service.createSheetsAndData();
    
    if (populateResult.success) {
      console.log('🎉 Data population successful!');
      console.log('📄 Spreadsheet URL:', populateResult.data?.url);
      console.log('📋 Sheets created:', populateResult.data?.sheetsCreated);
      
      return {
        success: true,
        message: 'تم إضافة البيانات بنجاح!',
        data: populateResult.data
      };
    } else {
      console.error('❌ Data population failed:', populateResult.message);
      return {
        success: false,
        message: populateResult.message
      };
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
    return {
      success: false,
      message: `خطأ في السكريبت: ${error.message}`
    };
  }
}

export { testAndPopulate };

// If run directly
if (typeof require !== 'undefined' && require.main === module) {
  testAndPopulate().then(result => {
    console.log('📄 Final result:', result);
    if (typeof process !== 'undefined') {
      process.exit(result.success ? 0 : 1);
    }
  });
}
