import { MemberForm } from './MemberForm';
import { AssignmentForm } from './AssignmentForm';
import { scrumBoard } from './scrumboard';
import './style.css';

async function render() {
    console.log('Rendering...');
    
    const board = document.querySelector('#scrum-board') as HTMLDivElement;
    if (board) {
        board.innerHTML = '';
    }
    
    await scrumBoard();
}

const board = document.querySelector('#scrum-board') as HTMLDivElement;
board.addEventListener('assignmentDeleted', () => render());
board.addEventListener('memberAssigned', () => render());
board.addEventListener('statusChanged', () => render());

MemberForm(render);
AssignmentForm(render);
render();