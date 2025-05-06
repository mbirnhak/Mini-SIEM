import {fetchApi, postApi} from './api';
import { Logfile } from '../types';

export async function loadLogFiles() {
    try {
        const response = await fetchApi('/events/logfiles');
        const logFiles = await response.json();
        const logFilesTab = document.getElementById('tab-log-files');

        if (!logFilesTab) {
            console.error('Log files tab element not found');
            return;
        }

        // Create table structure first with upload form
        logFilesTab.innerHTML = `
        <div class="upload-container">
          <h3>Upload Log File</h3>
          <div class="upload-form">
            <div class="form-group">
              <label for="source-name">Source Name:</label>
              <input type="text" id="source-name" placeholder="Enter source name">
            </div>
            <div class="form-group">
              <label for="source-type">Source Type:</label>
              <select id="source-type">
                <option value="Firewall">Firewall</option>
                <option value="IDS">Intrusion Detection System</option>
                <option value="Server">Server</option>
                <option value="Application">Application</option>
                <option value="Network">Network Device</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="log-file">Select Log File:</label>
              <input type="file" id="log-file" accept=".log,.txt">
            </div>
            <button id="upload-log-btn" class="action-btn">Upload Log File</button>
          </div>
          <div id="upload-status" class="upload-status"></div>
        </div>
        <div class="table-container" id="log-files-table-container">
          <h3>Log Files</h3>
          <table class="data-table" id="log-files-table">
            <thead>
              <tr>
                <th>File ID</th>
                <th>Filename</th>
                <th>Source Name</th>
                <th>Source Type</th>
                <th>Upload Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="log-files-body">
              <!-- Log files will be loaded here -->
            </tbody>
          </table>
        </div>
        `;

        const logFilesTableBody = document.getElementById('log-files-body');

        if (!logFilesTableBody) {
            console.error('Log files table body element not found after creation');
            return;
        }

        // Process each log file and add to table
        logFiles.forEach((logFile: Logfile) => {
            const row = document.createElement('tr');

            // Extract log file details with fallbacks
            const fileId = logFile.id || 'N/A';
            const filename = logFile.filename || 'Unknown';
            const sourceName = logFile.sourcename || 'Unknown';
            const sourceType = logFile.sourcetype || 'N/A';
            const uploadTime = logFile.uploadtime
                ? new Date(logFile.uploadtime).toLocaleString()
                : 'N/A';
            const status = logFile.status || 'Unknown';

            row.innerHTML = `
  <td>${fileId}</td>
  <td>${filename}</td>
  <td>${sourceName}</td>
  <td>${sourceType}</td>
  <td>${uploadTime}</td>
  <td>${status}</td>
  <td>
    <button class="action-btn view-btn" data-id="${fileId}">View</button>
    <button class="action-btn delete-btn" data-id="${fileId}">Delete</button>
  </td>
`;

            logFilesTableBody.appendChild(row);
        });

        // If no log files were found
        if (logFiles.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="empty-message">No log files found</td>';
            logFilesTableBody.appendChild(emptyRow);
        }

        // Add event listeners for action buttons
        initializeLogFileActionButtons();

        // Initialize the upload button event listener
        initializeUploadButton();

    } catch (error) {
        console.error('Error loading log files:', error);
        const logFilesTab = document.getElementById('tab-log-files');

        if (logFilesTab) {
            logFilesTab.innerHTML = '<div class="error">Failed to load log files</div>';
        }
    }
}

// Initialize action buttons
function initializeLogFileActionButtons() {
    // View button handler
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const id = target.getAttribute('data-id');
            if (id) {
                viewLogFile(id);
            }
        });
    });

    // Delete button handler
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const id = target.getAttribute('data-id');
            if (id) {
                deleteLogFile(id);
            }
        });
    });
}

// View log file details
export async function viewLogFile(id: string) {
    try {
        const response = await fetchApi(`/events/logfiles/${id}`);
        const logFile = await response.json();

        // Create and show modal with log file details
        const modalContent = document.getElementById('log-file-details');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="log-file-info">
                    <table>
                        <tr>
                            <th>File ID:</th>
                            <td>${logFile.id || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Filename:</th>
                            <td>${logFile.filename || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Source Name:</th>
                            <td>${logFile.sourcename || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Source Type:</th>
                            <td>${logFile.sourcetype || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Upload Time:</th>
                            <td>${logFile.uploadtime ? new Date(logFile.uploadtime).toLocaleString() : 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Status:</th>
                            <td>${logFile.status || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Uploaded By:</th>
                            <td>${typeof logFile.uploadedby === "object" ?
                                (logFile.uploadedby && logFile.uploadedby.id ? logFile.uploadedby.id : 'N/A') :
                                (logFile.uploadby || 'N/A')}</td>
                        </tr>
                    </table>
                </div>
                ${logFile.rawcontent ? `
                <div class="log-file-content">
                    <h3>File Content</h3>
                    <pre>${logFile.rawcontent}</pre>
                </div>` : ''}
            `;

            // Show the modal
            const modal = document.getElementById('log-file-modal');
            if (modal) {
                modal.classList.add('active');
            }
        }
    } catch (error) {
        console.error('Error viewing log file:', error);
        alert('Failed to load log file details');
    }
}

// Delete log file
async function deleteLogFile(id: string) {
    if (confirm('Are you sure you want to delete this log file?')) {
        try {
            await fetchApi(`/events/logfiles/${id}`, {
                method: 'DELETE'
            });

            // Reload the log files after deletion
            loadLogFiles();
        } catch (error) {
            console.error('Error deleting log file:', error);
            alert('Failed to delete log file');
        }
    }
}

// Add these functions to your file-service.ts file

// Initialize upload button functionality
function initializeUploadButton() {
    const uploadButton = document.getElementById('upload-log-btn');
    if (uploadButton) {
        uploadButton.addEventListener('click', handleLogFileUpload);
    }
}

// Handle log file upload
async function handleLogFileUpload() {
    const sourceNameInput = document.getElementById('source-name') as HTMLInputElement;
    const sourceTypeSelect = document.getElementById('source-type') as HTMLSelectElement;
    const fileInput = document.getElementById('log-file') as HTMLInputElement;
    const uploadStatus = document.getElementById('upload-status');

    // Validate inputs
    if (!sourceNameInput || !sourceTypeSelect || !fileInput || !uploadStatus) {
        console.error('Upload form elements not found');
        return;
    }

    const sourceName = sourceNameInput.value.trim();
    const sourceType = sourceTypeSelect.value;
    const file = fileInput.files?.[0];

    // Check if all fields are filled
    if (!sourceName) {
        uploadStatus.innerHTML = '<span class="error">Please enter a source name</span>';
        return;
    }

    if (!file) {
        uploadStatus.innerHTML = '<span class="error">Please select a file to upload</span>';
        return;
    }

    try {
        // Show loading status
        uploadStatus.innerHTML = '<span class="loading">Uploading file...</span>';

        // Read the file content
        const fileContent = await readFileAsText(file);

        // Prepare the log file object
        const logFile = {
            sourcename: sourceName,
            sourcetype: sourceType,
            filename: file.name,
            status: 'Pending', // Assuming PENDING is a valid LogFileStatus enum value
            rawcontent: fileContent
        };

        // Send the upload request
        const response = await postApi('/events/logfiles', logFile);

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        // Show success message
        uploadStatus.innerHTML = '<span class="success">File uploaded successfully!</span>';

        // Clear the form
        sourceNameInput.value = '';
        fileInput.value = '';

        // Reload the log files list to show the newly uploaded file
        await loadLogFiles();
    } catch (error) {
        console.error('Error uploading log file:', error);
        uploadStatus.innerHTML = `<span class="error">Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}</span>`;
    }
}

// Helper function to read file content as text
function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                resolve(event.target.result as string);
            } else {
                reject(new Error('Failed to read file'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };
        reader.readAsText(file);
    });
}