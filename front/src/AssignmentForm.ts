import { assignmentsAPI } from './scrumapi';

export async function AssignmentForm(onAssignmentAdded: () => void) {
    const form = document.querySelector('#assignment-form') as HTMLFormElement;
    const titleInput = document.querySelector('#assignment-title') as HTMLInputElement;
    const descriptionInput = document.querySelector('#assignment-description') as HTMLTextAreaElement;
    const categorySelect = document.querySelector('#assignment-category') as HTMLSelectElement;
    const errorDiv = document.querySelector('#assignment-form-error') as HTMLDivElement;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.textContent = '';

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const category = categorySelect.value as 'ux' | 'front' | 'back';

        if (!title || !category) {
            errorDiv.textContent = 'Please fill in title and category';
            return;
        }

        try {
            await assignmentsAPI.create({
                title,
                description,
                category,
                status: 'new',
                timestamp: Date.now(),
            });

            titleInput.value = '';
            descriptionInput.value = '';
            categorySelect.value = '';
            errorDiv.textContent = '';
            onAssignmentAdded();
        } catch (err) {
            errorDiv.textContent = 'Failed to add assignment. Please try again.';
            console.error(err);
        }
    });
}