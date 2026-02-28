import api from '../utils/api'

// Workflows
export async function getWorkflows() {
  const res = await api.get('/api/workflows')
  return res.data
}

export async function getWorkflow(id) {
  const res = await api.get(`/api/workflows/${id}`)
  return res.data
}

export async function createWorkflow(payload) {
  const res = await api.post('/api/workflows', payload)
  return res.data
}

export async function updateWorkflow(id, payload) {
  const res = await api.put(`/api/workflows/${id}`, payload)
  return res.data
}

export async function deleteWorkflow(id) {
  const res = await api.delete(`/api/workflows/${id}`)
  return res.data
}

// Nodes
export async function addNode(workflowId, node) {
  const res = await api.post(`/api/workflows/${workflowId}/nodes`, node)
  return res.data
}

export async function updateNode(workflowId, nodeId, node) {
  const res = await api.put(`/api/workflows/${workflowId}/nodes/${nodeId}`, node)
  return res.data
}

export async function deleteNode(workflowId, nodeId) {
  const res = await api.delete(`/api/workflows/${workflowId}/nodes/${nodeId}`)
  return res.data
}

export async function reorderNodes(workflowId, order) {
  const res = await api.patch(`/api/workflows/${workflowId}/nodes/reorder`, { ids: order })
  return res.data
}

// Runs
export async function runWorkflowApi(id) {
  const res = await api.post(`/api/workflows/${id}/run`)
  return res.data
}

export async function getWorkflowRuns(id, limit = 20) {
  const res = await api.get(`/api/workflows/${id}/runs?limit=${limit}`)
  return res.data
}

export async function getRun(runId) {
  const res = await api.get(`/api/runs/${runId}`)
  return res.data
}

export async function getAllRuns(limit = 20) {
  const res = await api.get(`/api/runs?limit=${limit}`)
  return res.data
}

export async function approveRun(runId, decision, comment = '') {
  const res = await api.post(`/api/runs/${runId}/approve`, { decision, comment })
  return res.data
}

// Templates
export async function getTemplates() {
  const res = await api.get('/api/workflows/templates')
  return res.data
}

export async function cloneTemplate(templateId) {
  const res = await api.post(`/api/workflows/from-template/${templateId}`)
  return res.data
}

// Dashboard
export async function getDashboardStats() {
  const res = await api.get('/api/workflows/dashboard/stats')
  return res.data
}
