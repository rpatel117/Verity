// Test with proper authentication
const { createClient } = require('@supabase/supabase-js');

async function testAuthenticatedCall() {
  console.log('🧪 Testing authenticated API call...');
  
  const supabaseUrl = 'https://rusqnjonwtgzcccyhjze.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c3Fuam9ud3RnemNjY3loanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTE3MDksImV4cCI6MjA3NjAyNzcwOX0.cIcjqiy-o4iMsj-h1URkJhKZr0k2WJpyrWUkdLZxBMM';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // First, let's try to get the current session
    console.log('📞 Getting current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('❌ No active session - user needs to be logged in');
      return;
    }
    
    console.log('✅ Active session found for user:', session.user.email);
    
    // Now try the API call with the session
    console.log('📞 Making authenticated API call...');
    const { data, error } = await supabase.functions.invoke('verify_attestation_code', {
      body: {
        attestationId: 'test-id',
        code: '123456'
      }
    });
    
    console.log('📥 Response data:', data);
    console.log('❌ Response error:', error);
    
  } catch (err) {
    console.error('💥 Exception thrown:', err.message);
  }
}

testAuthenticatedCall().catch(console.error);



