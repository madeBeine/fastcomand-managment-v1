import { addDataToRealGoogleSheets } from './services/workingGoogleSheets';

console.log('🚀 EXECUTING GOOGLE SHEETS DATA ADDITION NOW...');
console.log('⏰ Starting at:', new Date().toLocaleString('ar-SA'));

addDataToRealGoogleSheets()
  .then(result => {
    if (result.success) {
      console.log('🎉🎉🎉 SUCCESS! DATA ADDED TO GOOGLE SHEETS! 🎉🎉🎉');
      console.log('✅ Message:', result.message);
      console.log('📊 Spreadsheet URL:', result.data?.url);
      console.log('📋 Sheets created:', result.data?.sheetsPopulated);
      console.log('👥 Investors:', result.data?.totalInvestors);
      console.log('💰 Expenses:', result.data?.totalExpenses);
      console.log('📈 Revenues:', result.data?.totalRevenues);
      console.log('🏦 Withdrawals:', result.data?.totalWithdrawals);
      console.log('👤 Users:', result.data?.totalUsers);
      console.log('🕐 Completed at:', new Date().toLocaleString('ar-SA'));
      console.log('');
      console.log('🔗 DIRECT LINK TO YOUR GOOGLE SHEET:');
      console.log('https://docs.google.com/spreadsheets/d/1qU6wQ7KN3LoU_1atvbxSDLshYXZZ_DixgCBDcAcTfJA/edit');
      console.log('');
      console.log('✅ YOUR DATA IS NOW LIVE IN GOOGLE SHEETS!');
    } else {
      console.error('❌ FAILED:', result.message);
    }
  })
  .catch(error => {
    console.error('❌ EXECUTION ERROR:', error);
  });
