import { membersAPI } from './scrumapi';

export function MemberForm(onMemberAdded: () => void) {
    const form = document.querySelector('#member-form') as HTMLFormElement;
    const nameInput = document.querySelector('#member-name') as HTMLInputElement;
    const categorySelect = document.querySelector('#member-category') as HTMLSelectElement;
    const errorDiv = document.querySelector('#member-form-error') as HTMLDivElement;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.textContent = '';

        const name = nameInput.value.trim();
        const category = categorySelect.value as 'ux' | 'front' | 'back';

        if (!name || !category) {
            errorDiv.textContent = 'Please fill in all fields';
            return;
        }
        try {
            await membersAPI.create({ name, category });
            nameInput.value = '';
            categorySelect.value = '';
            errorDiv.textContent = '';
            onMemberAdded();
        } catch (err) {
            errorDiv.textContent = 'Failed to add member. Please try again.';
            console.error(err);
        }
    });
}