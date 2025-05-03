import { fetchApi } from './api';

export async function loadDevices() {
    try {
        const devices_response = await fetchApi('/devices');
        const devices = await devices_response.json();
        const devicesTable = document.getElementById('tab-devices');
        if (!devicesTable) return;

        devicesTable.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Hostname</th>
            <th>IP Address</th>
            <th>Operating System</th>
            <th>Location</th>
            <th>Device Type</th>
          </tr>
        </thead>
        <tbody>
          ${devices.map((device: any) => `
            <tr>
              <td>${device.id}</td>
              <td>${device.hostname}</td>
              <td>${device.ipaddress}</td>
              <td>${device.operatingsystem}</td>
              <td>${device.location}</td>
              <td>${device.devicetype}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    } catch (error) {
        console.error('Error loading devices:', error);
        const devicesTab = document.getElementById('tab-devices');
        if (devicesTab) {
            devicesTab.innerHTML = '<div class="error">Failed to load devices</div>';
        }
    }
}