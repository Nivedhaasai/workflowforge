// Simple smoke test used by CI to verify the backend is healthy and auth works.
// Runs on Node 20+ (uses global fetch).

const ROOT = process.env.E2E_BASE_URL || process.env.BASE_URL || 'http://localhost:5000'
const HEALTH = `${ROOT}/`
const LOGIN = `${ROOT}/api/auth/login`

async function waitFor(url, timeout = 30000, interval = 1000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url)
      if (res.ok) return true
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, interval))
  }
  return false
}

async function smokeTest() {
  console.log('CI smoke: waiting for backend...')
  const ok = await waitFor(HEALTH, 30000, 1000)
  if (!ok) {
    console.error('Backend did not respond at', HEALTH)
    process.exit(2)
  }

  console.log('Backend responding; testing login...')
  try {
    const resp = await fetch(LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nive@2809.com', password: 'nive2809' })
    })

    if (resp.status !== 200) {
      const txt = await resp.text()
      console.error('Login failed, status', resp.status, txt)
      process.exit(3)
    }

    const data = await resp.json()
    if (!data || !data.token) {
      console.error('Login response missing token:', JSON.stringify(data))
      process.exit(4)
    }

    console.log('Login successful — token length', (data.token || '').length)
    console.log('CI smoke test passed')
    process.exit(0)
  } catch (err) {
    console.error('Smoke test error:', err?.message || err)
    process.exit(5)
  }
}

// Export the smokeTest function so CI (or other runners) can require() and call it.
module.exports = { smokeTest };

// If the script is executed directly (node test-step6-verify.js), run the smoke test.
if (require.main === module) {
  smokeTest().catch(err => {
    console.error('Smoke test failed:', err?.message || err);
    process.exit(1);
  });
}
(async () => {
  const base = 'http://localhost:5000';
  try {
    console.log('=== LOGIN AS OWNER ===');
    const loginRes = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email: 'flowtest@example.com', password: 'password123' }) });
    if (loginRes.status !== 200) { console.error('Owner login failed', await loginRes.text()); process.exit(1); }
    const { token: ownerToken } = await loginRes.json();

    const headersOwner = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` };

    // Get a workflow
    const wfsRes = await fetch(`${base}/api/workflows`, { method: 'GET', headers: headersOwner });
    const wfs = await wfsRes.json();
    if (!wfs || wfs.length === 0) { console.error('No workflows for owner'); process.exit(1); }
    const wf = wfs[0];
    console.log('Owner workflow id:', wf._id, 'name:', wf.name);

    // List runs
    console.log('\n=== LIST RUNS ===');
    const runsRes = await fetch(`${base}/api/workflows/${wf._id}/runs`, { method: 'GET', headers: headersOwner });
    console.log('Status:', runsRes.status);
    const runs = await runsRes.json();
    console.log('Count:', Array.isArray(runs) ? runs.length : 'not array');
    if (Array.isArray(runs) && runs.length > 0) {
      console.log('First item:', runs[0]);
      var sampleRunId = runs[0].id;
    } else {
      console.log('No runs found for workflow (create and run a workflow first)');
      process.exit(0);
    }

    // Get run details
    console.log('\n=== GET RUN DETAILS ===');
    const runDetailRes = await fetch(`${base}/api/runs/${sampleRunId}`, { method: 'GET', headers: headersOwner });
    console.log('Status:', runDetailRes.status);
    const runDetail = await runDetailRes.json();
    console.log('Workflow name:', runDetail.workflow && runDetail.workflow.name);
    console.log('Status:', runDetail.status);
    console.log('Steps:', Array.isArray(runDetail.results) ? runDetail.results.length : 0);

    // Register a new user to test forbidden access
    console.log('\n=== REGISTER & LOGIN AS OTHER USER ===');
    const unique = Date.now();
    const regRes = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'other', email: `other${unique}@example.com`, password: 'password123' }) });
    if (regRes.status !== 201) { console.error('Register failed:', await regRes.text()); process.exit(1); }
    const { token: otherToken } = await regRes.json();
    const headersOther = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${otherToken}` };

    // Try to list runs for owner's workflow as other user
    console.log('\n=== FORBIDDEN ACCESS (LIST RUNS) ===');
    const forbiddenRes = await fetch(`${base}/api/workflows/${wf._id}/runs`, { method: 'GET', headers: headersOther });
    console.log('Status:', forbiddenRes.status);
    console.log('Body:', await forbiddenRes.json());

    // Try to get run detail as other user
    console.log('\n=== FORBIDDEN ACCESS (RUN DETAIL) ===');
    const forbiddenDetailRes = await fetch(`${base}/api/runs/${sampleRunId}`, { method: 'GET', headers: headersOther });
    console.log('Status:', forbiddenDetailRes.status);
    console.log('Body:', await forbiddenDetailRes.json());

    // Missing run
    console.log('\n=== MISSING RUN ===');
    const missingRes = await fetch(`${base}/api/runs/000000000000000000000000`, { method: 'GET', headers: headersOwner });
    console.log('Status:', missingRes.status);
    console.log('Body:', await missingRes.json());

    console.log('\nAll checks done.');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err.message);
    process.exit(1);
  }
})();
