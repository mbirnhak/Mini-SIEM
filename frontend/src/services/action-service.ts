import {fetchApi, postApi, updateApi} from './api';
import { Action } from '../types';

export async function loadActions() {
    try {
        const response = await fetchApi('/events/actions');
        const actions = await response.json();
        const actionsTab = document.getElementById('tab-actions');

        if (!actionsTab) {
            console.error('Actions tab element not found');
            return;
        }

        // Create table structure first
        actionsTab.innerHTML = `
        <div class="table-container" id="actions-table-container">
          <table class="data-table" id="actions-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody id="actions-body">
              <!-- Actions will be loaded here -->
            </tbody>
          </table>
        </div>
        `;

        const actionsTableBody = document.getElementById('actions-body');

        if (!actionsTableBody) {
            console.error('Actions table body element not found after creation');
            return;
        }

        // Process each action and add to table
        actions.forEach((action: Action) => {
            const row = document.createElement('tr');

            // Extract action details with fallbacks
            const actionName = action.action || 'N/A';
            const categoryName = action.categoryname?.categoryname || 'Uncategorized';

            row.innerHTML = `
  <td>${actionName}</td>
  <td>${categoryName !== 'Uncategorized' ?
                `<a href="#" class="category-link" data-category="${encodeURIComponent(categoryName)}">${categoryName}</a>` :
                `<span class="uncategorized">Uncategorized 
                    <button class="add-category-btn" data-action="${encodeURIComponent(actionName)}">
                        Add Category
                    </button>
                </span>`
            }</td>
`;

            actionsTableBody.appendChild(row);
        });

        // If no actions were found
        if (actions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="2" class="empty-message">No actions found</td>';
            actionsTableBody.appendChild(emptyRow);
        }

        // Add event listeners for category links
        addCategoryLinkListeners();
        addAddCategoryButtonListeners();

    } catch (error) {
        console.error('Error loading actions:', error);
        const actionsTab = document.getElementById('tab-actions');

        if (actionsTab) {
            actionsTab.innerHTML = '<div class="error">Failed to load actions</div>';
        }
    }
}

function addCategoryLinkListeners() {
    const categoryLinks = document.querySelectorAll('.category-link');

    categoryLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const categoryName = decodeURIComponent(link.getAttribute('data-category') || '');
            await showCategoryDetails(categoryName);
        });
    });
}

function addAddCategoryButtonListeners() {
    const addCategoryButtons = document.querySelectorAll('.add-category-btn');

    addCategoryButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const actionName = decodeURIComponent(button.getAttribute('data-action') || '');
            await showAddCategoryModal(actionName);
        });
    });
}

async function showAddCategoryModal(actionName: string) {
    // Create or get the add category modal
    let addCategoryModal = document.getElementById('add-category-modal');
    if (!addCategoryModal) {
        addCategoryModal = createAddCategoryModal();
    }

    // Fetch all available categories
    try {
        const response = await fetchApi('/events/categories');
        const categories = await response.json();

        // Update modal content
        const modalContent = document.getElementById('add-category-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <h3>Add Category for Action: ${actionName}</h3>
                <div class="category-selection">
                    <label for="category-select">Select a category:</label>
                    <select id="category-select">
                        <option value="">-- Select Category --</option>
                        ${categories.map((cat: any) => `
                            <option value="${cat.categoryname}">${cat.categoryname}</option>
                        `).join('')}
                    </select>
                    <button id="save-category-btn" class="save-btn">Save</button>
                    <button id="create-new-category-btn" class="create-btn">Create New Category</button>
                </div>
                <div id="new-category-form" style="display: none;">
                    <h4>Create New Category</h4>
                    <input type="text" id="new-category-name" placeholder="Category name" />
                    <textarea id="new-category-description" placeholder="Category description"></textarea>
                    <button id="confirm-create-category-btn" class="save-btn">Create Category</button>
                </div>
            `;

            // Add event listener for save button
            document.getElementById('save-category-btn')?.addEventListener('click', () => {
                saveCategory(actionName);
            });

            // Add event listener for create new category button
            document.getElementById('create-new-category-btn')?.addEventListener('click', () => {
                document.getElementById('new-category-form')!.style.display = 'block';
            });

            // Add event listener for confirm create button
            document.getElementById('confirm-create-category-btn')?.addEventListener('click', () => {
                createAndAssignNewCategory(actionName);
            });
        }

        // Show the modal
        addCategoryModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories');
    }
}

async function saveCategory(actionName: string) {
    const categorySelect = document.getElementById('category-select') as HTMLSelectElement;
    const selectedCategory = categorySelect.value;

    if (!selectedCategory) {
        alert('Please select a category');
        return;
    }

    try {
        // Update the action with the selected category
        const response = await updateApi(`/events/actions/${encodeURIComponent(actionName)}`,
            {
                categoryname: { categoryname: selectedCategory }
            });

        if (response.ok) {
            alert('Category assigned successfully');
            // Close the modal
            document.getElementById('add-category-modal')!.style.display = 'none';
            // Reload the actions table
            loadActions();
        } else {
            throw new Error('Failed to update action');
        }
    } catch (error) {
        console.error('Error updating action:', error);
        alert('Failed to assign category');
    }
}

async function createAndAssignNewCategory(actionName: string) {
    const categoryName = (document.getElementById('new-category-name') as HTMLInputElement).value;
    const categoryDescription = (document.getElementById('new-category-description') as HTMLTextAreaElement).value;

    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }

    try {
        // First, create the new category
        const createResponse = await postApi('/events/categories', {
            categoryname: categoryName,
            description: categoryDescription
        });

        if (createResponse.ok) {
            // Then assign it to the action
            const assignResponse = await updateApi(`/events/actions/${encodeURIComponent(actionName)}`,
                {
                    categoryname: { categoryname: categoryName }
                });

            if (assignResponse.ok) {
                alert('New category created and assigned successfully');
                // Close the modal
                document.getElementById('add-category-modal')!.style.display = 'none';
                // Reload the actions table
                loadActions();
            } else {
                throw new Error('Failed to assign the new category');
            }
        } else {
            throw new Error('Failed to create new category');
        }
    } catch (error) {
        console.error('Error creating/assigning category:', error);
        alert('Failed to create or assign category');
    }
}

export function createAddCategoryModal() {
    const addCategoryModal = document.createElement('div');
    addCategoryModal.id = 'add-category-modal';
    addCategoryModal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.setAttribute('data-modal', 'add-category-modal');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => {
        addCategoryModal.style.display = 'none';
    };

    const contentDiv = document.createElement('div');
    contentDiv.id = 'add-category-content';

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(contentDiv);
    addCategoryModal.appendChild(modalContent);

    document.body.appendChild(addCategoryModal);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === addCategoryModal) {
            addCategoryModal.style.display = 'none';
        }
    });

    return addCategoryModal;
}

async function showCategoryDetails(categoryName: string) {
    try {
        const response = await fetchApi(`/events/categories/${encodeURIComponent(categoryName)}`);
        const category = await response.json();

        // Create or get the category modal
        let categoryModal = document.getElementById('category-modal');
        if (!categoryModal) {
            categoryModal = createCategoryModal();
        }

        // Update modal content with the category details
        const modalContent = document.getElementById('category-details');
        if (modalContent) {
            modalContent.innerHTML = `
                <h3>${category.categoryname || 'Unknown Category'}</h3>
                <div class="category-description">
                    <p>${category.description || 'No description available'}</p>
                </div>
            `;
        }

        // Show the modal
        categoryModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching category details:', error);
        alert('Failed to load category details');
    }
}

export function createCategoryModal() {
    const categoryModal = document.createElement('div');
    categoryModal.id = 'category-modal';
    categoryModal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => {
        categoryModal.style.display = 'none';
    };

    const detailsDiv = document.createElement('div');
    detailsDiv.id = 'category-details';

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(detailsDiv);
    categoryModal.appendChild(modalContent);

    document.body.appendChild(categoryModal);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === categoryModal) {
            categoryModal.style.display = 'none';
        }
    });

    return categoryModal;
}