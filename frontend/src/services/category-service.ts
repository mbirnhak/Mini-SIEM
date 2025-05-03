import { fetchApi } from './api';
import { EventCategory } from '../types';

export async function loadEventCategories() {
    try {
        const response = await fetchApi('/events/categories');
        const eventCategories = await response.json();
        const eventCategoriesTab = document.getElementById('tab-event-categories');

        if (!eventCategoriesTab) {
            console.error('Event categories tab element not found');
            return;
        }

        // Create table structure first
        eventCategoriesTab.innerHTML = `
        <div class="table-container" id="event-categories-table-container">
          <table class="data-table" id="event-categories-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody id="event-categories-body">
              <!-- Event categories will be loaded here -->
            </tbody>
          </table>
        </div>
        `;

        const eventCategoriesTableBody = document.getElementById('event-categories-body');

        if (!eventCategoriesTableBody) {
            console.error('Event categories table body element not found after creation');
            return;
        }

        // Process each event category and add to table
        eventCategories.forEach((category: EventCategory) => {
            const row = document.createElement('tr');

            // Extract event category details with fallbacks
            const categoryName = category.categoryname || 'Unnamed Category';
            const description = category.description || 'No description available';

            row.innerHTML = `
  <td>${categoryName}</td>
  <td>${description}</td>
`;

            eventCategoriesTableBody.appendChild(row);
        });

        // If no event categories were found
        if (eventCategories.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="2" class="empty-message">No event categories found</td>';
            eventCategoriesTableBody.appendChild(emptyRow);
        }

    } catch (error) {
        console.error('Error loading event categories:', error);
        const eventCategoriesTab = document.getElementById('tab-event-categories');

        if (eventCategoriesTab) {
            eventCategoriesTab.innerHTML = '<div class="error">Failed to load event categories</div>';
        }
    }
}