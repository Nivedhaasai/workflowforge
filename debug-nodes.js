(async () => {
  try {
    const base = 'http://localhost:5000';

    // Get token
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'flowtest@example.com', password: 'password123' })
    });
    const loginBody = await loginRes.json();
    const token = loginBody.token;
    console.log('Token:', token.substring(0, 20) + '...');

    // Create workflow
    const wfRes = await fetch(`${base}/api/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'Test', description: 'Test' })
    });
    const wf = await wfRes.json();
    const workflowId = wf._id;
    console.log('Workflow created:', workflowId);

    // Try to create node
    console.log('\n--- Attempting to create node ---');
    console.log('URL: POST', `${base}/api/workflows/${workflowId}/nodes`);
    const nodeRes = await fetch(`${base}/api/workflows/${workflowId}/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type: 'text', config: { content: 'Hello' } })
    });
    console.log('Status:', nodeRes.status);
    console.log('Headers:', Object.fromEntries(nodeRes.headers));
    const text = await nodeRes.text();
    console.log('Response body (first 500 chars):', text.substring(0, 500));
    
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
