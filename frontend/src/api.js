async function request(path, options) {
  const res = await fetch(`/api${path}`, options)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export const getKpis = () => request('/kpis')

export const getTickets = (status) =>
  request(status && status !== 'All' ? `/tickets?status=${encodeURIComponent(status)}` : '/tickets')

export const createTicket = (payload) =>
  request('/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const parseGuideline = (text) =>
  request('/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

export const sendTicket = (id) => request(`/tickets/${id}/send`, { method: 'POST' })

export const updateTicketStatus = (id, status) =>
  request(`/tickets/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

export const getPartners = () => request('/partners')
