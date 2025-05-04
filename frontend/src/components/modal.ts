export function setupModals() {
    const loginModal = document.getElementById('login-modal') as HTMLElement;
    const registerModal = document.getElementById('register-modal') as HTMLElement;
    const logFileModal = document.getElementById('log-file-modal') as HTMLElement;
    const categoryModal = document.getElementById('category-modal') as HTMLElement;
    const addCategoryModal = document.getElementById('add-category-modal') as HTMLElement;

    const loginBtn = document.getElementById('login-button');
    const registerBtn = document.getElementById('register-button');
    const closeBtns = document.querySelectorAll('.close');

    // Open login modal
    loginBtn?.addEventListener('click', () => {
        if (registerModal) registerModal.style.display = 'none';
        if (logFileModal) logFileModal.style.display = 'none';
        if (categoryModal) categoryModal.style.display = 'none';
        if (addCategoryModal) addCategoryModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Open register modal
    registerBtn?.addEventListener('click', () => {
        loginModal.style.display = 'none';
        if (logFileModal) logFileModal.style.display = 'none';
        if (categoryModal) categoryModal.style.display = 'none';
        if (addCategoryModal) addCategoryModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    // Close modals when clicking on X
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModals();
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === loginModal || event.target === registerModal ||
            event.target === logFileModal || event.target === categoryModal ||
            event.target === addCategoryModal) {
            closeModals();
        }
    });
}

export function closeModals() {
    const loginModal = document.getElementById('login-modal') as HTMLElement;
    const registerModal = document.getElementById('register-modal') as HTMLElement;
    const logFileModal = document.getElementById('log-file-modal') as HTMLElement;
    const categoryModal = document.getElementById('category-modal') as HTMLElement;
    const addCategoryModal = document.getElementById('add-category-modal') as HTMLElement;

    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
    if (logFileModal) {
        logFileModal.style.display = 'none';
    }
    if (categoryModal) {
        categoryModal.style.display = 'none';
    }
    if (addCategoryModal) {
        addCategoryModal.style.display = 'none';
    }
}

export function createRawlineModal() {
    let rawlineModal = document.getElementById('rawline-modal');

    if (!rawlineModal) {
        rawlineModal = document.createElement('div');
        rawlineModal.id = 'rawline-modal';
        rawlineModal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            rawlineModal.style.display = 'none';
        };

        const title = document.createElement('h2');
        title.textContent = 'Raw Line Details';

        const detailsDiv = document.createElement('div');
        detailsDiv.id = 'rawline-details';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(detailsDiv);
        rawlineModal.appendChild(modalContent);

        document.body.appendChild(rawlineModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === rawlineModal) {
                rawlineModal.style.display = 'none';
            }
        });
    }

    return rawlineModal;
}