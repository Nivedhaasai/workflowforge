const { v4: uuidv4 } = require('uuid')

const templates = [
  {
    id: 'leave-request',
    name: 'Leave Request Approval',
    description: 'Employee submits a leave request that routes through manager approval with automatic notification.',
    icon: '📋',
    category: 'HR',
    nodes: [
      { id: uuidv4(), type: 'text', config: { message: 'Employee submits leave request', content: 'Employee submits leave request' } },
      { id: uuidv4(), type: 'approval', config: { assignedTo: 'manager@company.com', message: 'Please approve this leave request' } },
      { id: uuidv4(), type: 'condition', config: { field: 'decision', operator: '==', value: 'approved' } },
      { id: uuidv4(), type: 'text', config: { message: 'Leave approved and recorded. Employee notified.', content: 'Leave approved and recorded. Employee notified.' } }
    ]
  },
  {
    id: 'http-data-fetch',
    name: 'HTTP Data Fetch & Transform',
    description: 'Fetch data from an external API, transform it using templates, and process the results.',
    icon: '🌐',
    category: 'Integration',
    nodes: [
      { id: uuidv4(), type: 'http', config: { url: 'https://jsonplaceholder.typicode.com/users/1', method: 'GET' } },
      { id: uuidv4(), type: 'transform', config: { outputKey: 'greeting', template: 'Welcome {{name}}! Your email is {{email}}' } },
      { id: uuidv4(), type: 'text', config: { message: 'Data processed successfully', content: 'Data processed successfully' } }
    ]
  },
  {
    id: 'delayed-notification',
    name: 'Delayed Notification Workflow',
    description: 'Start a process, wait for a specified delay, then send a timed notification.',
    icon: '⏳',
    category: 'Notification',
    nodes: [
      { id: uuidv4(), type: 'text', config: { message: 'Workflow started', content: 'Workflow started' } },
      { id: uuidv4(), type: 'delay', config: { ms: 3000, seconds: 3 } },
      { id: uuidv4(), type: 'transform', config: { outputKey: 'notification', template: 'Task completed at: {{timestamp}}' } },
      { id: uuidv4(), type: 'text', config: { message: 'Notification sent', content: 'Notification sent' } }
    ]
  }
]

module.exports = templates
