import { test, expect } from '@playwright/test';

function randEmail(){ return `e2e-${Date.now()}@example.com` }

test('register -> create workflow -> add node -> run -> poll run', async ({ request }) => {
  const base = request; // uses baseURL from config

  // Register
  const email = randEmail();
  const pwd = 'Password123!';
  const r1 = await base.post('/api/auth/register', { data: { email, password: pwd } });
  expect(r1.ok()).toBeTruthy();

  // Login
  const r2 = await base.post('/api/auth/login', { data: { email, password: pwd } });
  expect(r2.ok()).toBeTruthy();
  const login = await r2.json();
  const token = login.token;
  expect(token).toBeTruthy();

  const auth = { headers: { Authorization: `Bearer ${token}` } } as any;

  // Create workflow
  const wfRes = await base.post('/api/workflows', { data: { name: 'e2e workflow', description: 'created by e2e' }, ...auth });
  expect(wfRes.ok()).toBeTruthy();
  const wf = await wfRes.json();
  expect(wf._id).toBeTruthy();

  // Add a text node
  const nodeRes = await base.post(`/api/workflows/${wf._id}/nodes`, { data: { type: 'text', config: { text: 'hello e2e' } }, ...auth });
  expect(nodeRes.ok()).toBeTruthy();
  const node = await nodeRes.json();

  // Start run
  const runRes = await base.post(`/api/workflows/${wf._id}/run`, { ...auth });
  expect(runRes.status()).toBe(202);
  const { runId } = await runRes.json();
  expect(runId).toBeTruthy();

  // Poll run until complete or timeout
  const timeout = Date.now() + 30_000; // 30s
  let runData = null;
  while(Date.now() < timeout){
    const r = await base.get(`/api/runs/${runId}`, { ...auth });
    if(!r.ok()) throw new Error('Failed to fetch run')
    runData = await r.json();
    if(runData.status !== 'running') break;
    await new Promise(res => setTimeout(res, 1000));
  }

  expect(runData).not.toBeNull();
  expect(['completed','failed']).toContain(runData.status);
  expect(runData.steps && runData.steps.length > 0).toBeTruthy();
});
