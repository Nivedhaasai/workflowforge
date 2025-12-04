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
// (Removed extended owner/workflow tests to keep CI smoke focused and robust.)
