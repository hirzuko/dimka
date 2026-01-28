// API configuration for self-hosted deployment
// Change this to your server URL in production

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  // Auth
  async login(username: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async verifyToken(token: string) {
    const res = await fetch(`${API_URL}/api/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.ok;
  },

  // Tickets
  async createTicket(clientName: string) {
    const res = await fetch(`${API_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName }),
    });
    if (!res.ok) throw new Error('Failed to create ticket');
    return res.json();
  },

  async getTicket(ticketId: string) {
    const res = await fetch(`${API_URL}/api/tickets/${ticketId}`);
    if (!res.ok) throw new Error('Ticket not found');
    return res.json();
  },

  async getAllTickets(token: string) {
    const res = await fetch(`${API_URL}/api/tickets`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },

  async updateTicketStatus(ticketId: string, status: string, token: string) {
    const res = await fetch(`${API_URL}/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update ticket');
    return res.json();
  },

  // Messages
  async sendMessage(ticketId: string, content: string, sender: string) {
    const res = await fetch(`${API_URL}/api/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, sender }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async sendReply(ticketId: string, content: string, token: string) {
    const res = await fetch(`${API_URL}/api/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to send reply');
    return res.json();
  },
};
