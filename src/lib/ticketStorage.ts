// Centralized ticket storage utility
// For testing across devices, use the same browser or connect Lovable Cloud for real persistence

interface Message {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: string;
}

export interface Ticket {
  id: string;
  name: string;
  messages: Message[];
  lastMessage?: string;
  timestamp: string;
  status: "active" | "resolved";
}

const STORAGE_KEY = "support_tickets";

export const getAllTickets = (): Ticket[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getTicketById = (id: string): Ticket | null => {
  const tickets = getAllTickets();
  return tickets.find(t => t.id === id) || null;
};

export const createTicket = (name: string): Ticket => {
  const ticket: Ticket = {
    id: Date.now().toString(),
    name,
    messages: [],
    timestamp: new Date().toISOString(),
    status: "active"
  };
  
  const tickets = getAllTickets();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([ticket, ...tickets]));
  
  return ticket;
};

export const addMessageToTicket = (ticketId: string, message: Omit<Message, "id" | "timestamp">): Message | null => {
  const tickets = getAllTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) return null;
  
  const newMessage: Message = {
    ...message,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  
  tickets[ticketIndex].messages.push(newMessage);
  tickets[ticketIndex].lastMessage = message.text;
  tickets[ticketIndex].timestamp = new Date().toISOString();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  
  return newMessage;
};

export const updateTicketStatus = (ticketId: string, status: "active" | "resolved"): void => {
  const tickets = getAllTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex !== -1) {
    tickets[ticketIndex].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }
};

// Generate a shareable ticket URL
export const getTicketUrl = (ticketId: string): string => {
  return `${window.location.origin}/chat?ticket=${ticketId}`;
};
