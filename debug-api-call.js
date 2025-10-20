// Simple test to debug the API call
const { createClient } = require('@supabase/supabase-js');

async function testApiCall() {
  console.log('🧪 Testing API call to verify_attestation_code...');
  
  const supabaseUrl = 'https://rusqnjonwtgzcccyhjze.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c3Fuam9ud3RnemNjY3loanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTE3MDksImV4cCI6MjA3NjAyNzcwOX0.7Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('📞 Making API call...');
    const { data, error } = await supabase.functions.invoke('verify_attestation_code', {
      body: {
        attestationId: 'test-id',
        code: '123456'
      }
    });
    
    console.log('📥 Response data:', data);
    console.log('❌ Response error:', error);
    
    if (error) {
      console.log('🚨 API returned error:', error.message);
    } else {
      console.log('✅ API returned data:', data);
    }
    
  } catch (err) {
    console.error('💥 Exception thrown:', err.message);
    console.error('💥 Stack:', err.stack);
  }
}

testApiCall().catch(console.error);



