import { fetchApi } from './api';
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
                categoryName}</td>
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