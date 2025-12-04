import api from '../utils/api'

export async function getWorkflows(){
  const res = await api.get('/api/workflows')
  return res.data
}

export async function getWorkflow(id){
  const res = await api.get(`/api/workflows/${id}`)
  return res.data
}

export async function addNode(workflowId, node){
  const res = await api.post(`/api/workflows/${workflowId}/nodes`, node)
  return res.data
}

export async function updateNode(workflowId, nodeId, node){
  const res = await api.put(`/api/workflows/${workflowId}/nodes/${nodeId}`, node)
  return res.data
}

export async function deleteNode(workflowId, nodeId){
  const res = await api.delete(`/api/workflows/${workflowId}/nodes/${nodeId}`)
  return res.data
}

export async function reorderNodes(workflowId, order){
  // order: array of node ids in desired order
  // send payload as { ids: [...] } for backend expectation
  const res = await api.patch(`/api/workflows/${workflowId}/nodes/reorder`, { ids: order })
  return res.data
}

export async function createWorkflow(payload){
  const res = await api.post('/api/workflows', payload)
  return res.data
}

export async function deleteWorkflow(id){
  const res = await api.delete(`/api/workflows/${id}`)
  return res.data
}

export async function updateWorkflow(id, payload){
  const res = await api.put(`/api/workflows/${id}`, payload)
  return res.data
}

export async function runWorkflowApi(id){
  const res = await api.post(`/api/workflows/${id}/run`)
  return res.data
}

export async function getWorkflowRuns(id, limit=20){
  const res = await api.get(`/api/workflows/${id}/runs?limit=${limit}`)
  return res.data
}

export async function getRun(runId){
  const res = await api.get(`/api/runs/${runId}`)
  return res.data
}
