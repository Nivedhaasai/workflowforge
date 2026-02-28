const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Workflow = require('./models/Workflow')
const { v4: uuidv4 } = require('uuid')

let seeded = false

async function seedDefaultUser() {
  if (seeded) return
  seeded = true

  try {
    const email = 'nive@2809.com'
    let user = await User.findOne({ email: email.toLowerCase() })
    if (user) {
      console.log('✓ Default admin user exists')
    } else {
      const salt = await bcrypt.genSalt(10)
      const password_hash = await bcrypt.hash('nive2809', salt)

      user = new User({
        name: 'Nivedhaa',
        email: email.toLowerCase(),
        password_hash,
      })

      await user.save()
      console.log('✓ Default admin user created')
    }

    // Seed demo workflows if none exist
    await seedDemoWorkflows(user._id)
  } catch (err) {
    console.error('Default user seed failed:', err?.message || err)
  }
}

async function seedDemoWorkflows(ownerId) {
  const count = await Workflow.countDocuments({ owner: ownerId })
  if (count > 0) {
    console.log(`✓ ${count} workflow(s) already exist — skipping demo seed`)
    return
  }

  const demos = [
    {
      name: 'Hello World Pipeline',
      description: 'A simple starter workflow: trigger → send a greeting → wait 3 seconds → send a follow-up.',
      nodes: [
        { id: uuidv4(), type: 'trigger', config: {} },
        { id: uuidv4(), type: 'text', config: { message: 'Hello from WorkflowForge! 🚀' } },
        { id: uuidv4(), type: 'delay', config: { seconds: 3, ms: 3000 } },
        { id: uuidv4(), type: 'text', config: { message: 'Pipeline complete — you just ran your first workflow!' } },
      ],
    },
    {
      name: 'API Fetch & Approval',
      description: 'Fetch data from a public API, then request human approval before continuing.',
      nodes: [
        { id: uuidv4(), type: 'trigger', config: {} },
        { id: uuidv4(), type: 'http', config: { url: 'https://httpbin.org/get', method: 'GET' } },
        { id: uuidv4(), type: 'condition', config: { field: 'status', operator: '==', value: '200' } },
        { id: uuidv4(), type: 'approval', config: { assignedTo: '', instructions: 'Review the API response and approve to continue.' } },
        { id: uuidv4(), type: 'text', config: { message: 'Approved! Workflow completed successfully.' } },
      ],
    },
  ]

  for (const demo of demos) {
    await Workflow.create({ ...demo, owner: ownerId })
    console.log(`✓ Seeded demo workflow: "${demo.name}"`)
  }
}

module.exports = { seedDefaultUser }
