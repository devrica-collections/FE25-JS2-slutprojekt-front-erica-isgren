import { assignmentsAPI, membersAPI } from './scrumapi';
import type { Assignment, Member } from './types';

type StatusConfig = {
    label: string;
};

const STATUS_CONFIG: Record<'new' | 'doing' | 'done', StatusConfig> = {
    new: { label: 'new' },
    doing: { label: 'doing' },
    done: { label: 'done' },
};

function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function createCardHeader(assignment: Assignment): HTMLElement {
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    
    const titleStrong = document.createElement('h1');
    titleStrong.textContent = `${assignment.title}`;
    cardHeader.appendChild(titleStrong);

    if (assignment.status === 'done') {
        cardHeader.appendChild(createDeleteButton(assignment.id));
    }
    return cardHeader;
}

function createDeleteButton(assignmentId: string): HTMLElement {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'card-delete';
    deleteBtn.setAttribute('data-id', assignmentId);
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.textContent = 'Delete x'
    deleteBtn.addEventListener('click', handleDeleteClick);
    return deleteBtn;
}

function createDescription(description: string): HTMLElement {
    const p = document.createElement('p');
    p.className = 'card-description';
    p.textContent = description;
    return p;
}

function createCategoryBadge(category: string): HTMLElement {
    const span = document.createElement('span');
    span.className = 'card-category';
    span.textContent = category;
    return span;
}

function createTimestamp(timestamp: number): HTMLElement {
    const p = document.createElement('p');
    p.className = 'card-timestamp';
    p.textContent = `Created: ${formatDate(timestamp)}`;
    return p;
}

function createMemberAssignSection(assignment: Assignment, matchingMembers: Member[]): HTMLElement {
    const div = document.createElement('div');
    div.className = 'card-member-assign';

    if (assignment.status === 'new') {
        const label = document.createElement('label');
        label.textContent = 'Assign Member:';
        div.appendChild(label);
        
        const select = document.createElement('select');
        select.className = 'card-member-select';
        select.setAttribute('data-id', assignment.id);
        
        const unassignedOption = document.createElement('option');
        unassignedOption.value = '';
        unassignedOption.textContent = 'Unassigned';
        select.appendChild(unassignedOption);
        
        matchingMembers.forEach((member: Member) => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            if (assignment.assigneeId === member.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        select.addEventListener('change', handleMemberChange);
        div.appendChild(select);
    };
    return div;
}

function createAssigneeDisplay(assignment: Assignment & { assignee?: Member | null }): HTMLElement {
    const p = document.createElement('p');
    p.className = 'card-assignee';
    
    const strong = document.createElement('strong');
    strong.textContent = assignment.assignee ? assignment.assignee.name : 'Unassigned';
    
    p.appendChild(document.createTextNode('Assigned: '));
    p.appendChild(strong);
    return p;
}

function createStatusButtons(assignment: Assignment): HTMLElement {
    const div = document.createElement('div');
    div.className = 'card-status-buttons';
    
    if (assignment.status === 'new') {
        div.appendChild(createStatusButton(assignment.id, 'doing', 'Move to Doing →'));
    } else if (assignment.status === 'doing') {
        div.appendChild(createStatusButton(assignment.id, 'done', 'Move to Done →'));
    }
    return div;
}

function createStatusButton(assignmentId: string, newStatus: string, label: string): HTMLElement {
    const btn = document.createElement('button');
    btn.className = 'card-status-btn';
    btn.setAttribute('data-id', assignmentId);
    btn.setAttribute('data-status', newStatus);
    btn.setAttribute('type', 'button');
    btn.textContent = label;
    btn.addEventListener('click', handleStatusClick);
    return btn;
}

function createCard(assignment: Assignment & { assignee?: Member | null }, matchingMembers: Member[]): HTMLElement {
    const card = document.createElement('div');
    card.className = 'scrum-card';

    card.appendChild(createCardHeader(assignment));
    card.appendChild(createDescription(assignment.description));
    card.appendChild(createCategoryBadge(assignment.category));
    card.appendChild(createTimestamp(assignment.timestamp));
    card.appendChild(createMemberAssignSection(assignment, matchingMembers));
    card.appendChild(createAssigneeDisplay(assignment));
    card.appendChild(createStatusButtons(assignment));
    return card;
}

function createColumn(status: string): HTMLElement {
    const column = document.createElement('div');
    column.className = 'scrum-column';
    
    const title = document.createElement('h3');
    title.textContent = STATUS_CONFIG[status as 'new' | 'doing' | 'done'].label;
    column.appendChild(title);
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'scrum-cards';
    cardsContainer.setAttribute('data-status', status);
    column.appendChild(cardsContainer);
    return column;
}

async function handleDeleteClick(this: HTMLButtonElement, e: Event) {
    e.preventDefault();
    e.stopPropagation();
    
    const id = this.getAttribute('data-id');
    
    try {
        await assignmentsAPI.delete(id!);
        const board = document.querySelector('#scrum-board') as HTMLDivElement;
        const refreshEvent = new CustomEvent('assignmentDeleted', { detail: { id } });
        board.dispatchEvent(refreshEvent);
    } catch (err) {
        console.error('Failed to delete assignment:', err);
    }
}

async function handleMemberChange(this: HTMLSelectElement, e: Event) {
    e.preventDefault();
    
    const assignmentId = this.getAttribute('data-id');
    const memberId = this.value;
        
    try {
        if (memberId) {
            await assignmentsAPI.assign(assignmentId!, memberId);
        } else {
            await assignmentsAPI.unassign(assignmentId!);
        }
        
        const board = document.querySelector('#scrum-board') as HTMLDivElement;
        const assignEvent = new CustomEvent('memberAssigned', { detail: { assignmentId, memberId } });
        board.dispatchEvent(assignEvent);
    } catch (err) {
        console.error('Failed to assign member:', err);
    }
}

async function handleStatusClick(this: HTMLButtonElement, e: Event) {
    e.preventDefault();
    e.stopPropagation();
    
    const assignmentId = this.getAttribute('data-id');
    const newStatus = this.getAttribute('data-status');
        
    try {
        await assignmentsAPI.updateStatus(assignmentId!, newStatus!);
        
        const board = document.querySelector('#scrum-board') as HTMLDivElement;
        const statusEvent = new CustomEvent('statusChanged', { detail: { assignmentId, newStatus } });
        board.dispatchEvent(statusEvent);
    } catch (err) {
        console.error('Failed to update status:', err);
    }
}

export async function scrumBoard() {
    const board = document.querySelector('#scrum-board') as HTMLDivElement;

    try {
        const assignments = await assignmentsAPI.getWithMembers() as (Assignment & { assignee?: Member | null })[];
        const members = await membersAPI.getAll() as Member[];        
        board.innerHTML = '';

        Object.keys(STATUS_CONFIG).forEach((status) => {
            board.appendChild(createColumn(status));
        });

        assignments.forEach((assignment: Assignment & { assignee?: Member | null }) => {
            const cardsContainer = board.querySelector(
                `.scrum-cards[data-status="${assignment.status}"]`
            ) as HTMLDivElement;
            
            if (cardsContainer) {
                const matchingMembers = members.filter(
                    (m: Member) => m.category === assignment.category
                );
                cardsContainer.appendChild(createCard(assignment, matchingMembers));
            }
        });

    } catch (err) {
        board.innerHTML = '';
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Failed to load scrum board';
        board.appendChild(errorMsg);
        console.error('Failed to load assignments:', err);
    }
}