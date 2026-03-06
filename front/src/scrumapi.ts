import type { Assignment, Member } from "./types";

const API_BASE_URL = 'http://localhost:3000';

async function request(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    if (response.status === 204 || response.status === 205) {
        return null;
    }
    
    return response.json();
}

export const membersAPI = {
    getAll: () => request('/members'),
    create: (data: Omit<Member, 'id'>) => request('/members', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

export const assignmentsAPI = {
    create: (data: Omit<Assignment, 'id'>) => request('/assignments', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    updateStatus: (id: string, status: string) => request(`/assignments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
    
    assign: (id: string, memberId: string) => request(`/assignments/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ memberId }),
    }),
    
    unassign: (id: string) => request(`/assignments/${id}/unassign`, {
        method: 'PATCH',
    }),

    delete: (id: string) => request(`/assignments/${id}`, {
        method: 'DELETE',
    }), 

    getWithMembers: () => request('/assignments/with-members'),
};