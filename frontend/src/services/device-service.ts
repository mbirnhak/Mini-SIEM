import {deleteApi, fetchApi} from './api';
import { Device } from '../types'

export async function loadDevices() {
    try {
        const response = await fetchApi('/devices');
        const devices = await response.json();
        const devicesTab = document.getElementById('tab-devices');

        if (!devicesTab) {
            console.error('Devices tab element not found');
            return;
        }

        // Create table structure first
        devicesTab.innerHTML = `
        <div class="table-container" id="devices-table-container">
          <table class="data-table" id="devices-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hostname</th>
                <th>IP Address</th>
                <th>Operating System</th>
                <th>Location</th>
                <th>Device Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="devices-body">
              <!-- Devices will be loaded here -->
            </tbody>
          </table>
        </div>
        `;

        const devicesTableBody = document.getElementById('devices-body');

        if (!devicesTableBody) {
            console.error('Devices table body element not found after creation');
            return;
        }

        // Process each device and add to table
        devices.forEach((device: Device) => {
            const row = document.createElement('tr');

            // Extract device details with fallbacks
            const id = device.id || 'N/A';
            const hostname = device.hostname || 'Unknown';
            const ipAddress = device.ipaddress || 'N/A';
            const os = device.operatingsystem || 'Unknown';
            const location = device.location || 'Unspecified';
            const deviceType = device.devicetype || 'Other';

            row.innerHTML = `
  <td>${id}</td>
  <td>${hostname}</td>
  <td>${ipAddress}</td>
  <td>${os}</td>
  <td>${location}</td>
  <td>${deviceType}</td>
    <td>
    <button class="action-btn delete-btn" data-id="${id}">Delete</button>
  </td>
`;

            devicesTableBody.appendChild(row);
        });

        // If no devices were found
        if (devices.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="empty-message">No devices found</td>';
            devicesTableBody.appendChild(emptyRow);
        }

        initializeDeviceActionButtons();

    } catch (error) {
        console.error('Error loading devices:', error);
        const devicesTab = document.getElementById('tab-devices');

        if (devicesTab) {
            devicesTab.innerHTML = '<div class="error">Failed to load devices</div>';
        }
    }
}

// Initialize action buttons
function initializeDeviceActionButtons() {
    // Delete button handler
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const id = target.getAttribute('data-id');
            if (id) {
                deleteDevice(id);
            }
        });
    });
}

async function deleteDevice(id: string) {
    if (confirm('Are you sure you want to delete this device?')) {
        try {
            await deleteApi(`/devices/${id}`);

            // Reload the devices after deletion
            loadDevices();
        } catch (error) {
            console.error('Error deleting device:', error);
            alert('Failed to delete device');
        }
    }
}