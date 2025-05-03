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
  <td>${categoryName}</td>
`;

            actionsTableBody.appendChild(row);
        });

        // If no actions were found
        if (actions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="2" class="empty-message">No actions found</td>';
            actionsTableBody.appendChild(emptyRow);
        }

    } catch (error) {
        console.error('Error loading actions:', error);
        const actionsTab = document.getElementById('tab-actions');

        if (actionsTab) {
            actionsTab.innerHTML = '<div class="error">Failed to load actions</div>';
        }
    }
}