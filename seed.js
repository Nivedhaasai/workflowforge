const bcrypt = require('bcryptjs')
const User = require('./models/User')

let seeded = false

async function seedDefaultUser() {
  if (seeded) return
  seeded = true

  try {
    const email = 'nive@2809.com'
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      console.log('✓ Default admin user exists')
      return
    }

    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash('nive2809', salt)

    const u = new User({
      name: 'Nivedhaa',
      email: email.toLowerCase(),
      password_hash,
    })

    await u.save()
    console.log('✓ Default admin user created: nive@2809.com / nive2809')
  } catch (err) {
    console.error('Default user seed failed:', err?.message || err)
  }
}

module.exports = { seedDefaultUser }
