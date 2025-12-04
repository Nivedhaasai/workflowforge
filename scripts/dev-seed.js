cd frontend
npm install   # if you haven't installed deps
npm run devrequire('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Workflow = require('../models/Workflow')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/workflowforge'

async function main(){
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('Connected to Mongo')

  const email = 'devtester+1@example.com'
  let user = await User.findOne({ email: email.toLowerCase() })
  if(!user){
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash('Password123!', salt)
    user = new User({ name: 'Dev Tester', email: email.toLowerCase(), password_hash })
    await user.save()
    console.log('Created dev user:', email, '/ Password123!')
  } else {
    console.log('Dev user exists:', email)
  }

  // Create sample workflow
  const existing = await Workflow.findOne({ owner: user._id, name: 'Dev Seed Workflow' })
  if(existing){
    console.log('Sample workflow already exists:', existing._id.toString())
  } else {
    const wf = new Workflow({
      name: 'Dev Seed Workflow',
      description: 'Seeded workflow with sample nodes',
      owner: user._id,
      nodes: [
        { id: require('uuid').v4(), type: 'text', config: { content: 'Hello from seed' } },
        { id: require('uuid').v4(), type: 'delay', config: { ms: 500 } },
        { id: require('uuid').v4(), type: 'http', config: { url: 'https://httpbin.org/get' } }
      ]
    })
    await wf.save()
    console.log('Created sample workflow:', wf._id.toString())
  }

  await mongoose.disconnect()
  console.log('Done')
}

main().catch(err=>{ console.error(err); process.exit(1) })
