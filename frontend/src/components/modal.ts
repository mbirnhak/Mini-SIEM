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
        if (registerModal) registerModal.classList.remove('active');
        if (logFileModal) logFileModal.classList.remove('active');
        if (categoryModal) categoryModal.classList.remove('active');
        if (addCategoryModal) addCategoryModal.classList.remove('active');
        loginModal.classList.add('active');
    });

    // Open register modal
    registerBtn?.addEventListener('click', () => {
        loginModal.classList.remove('active');
        if (logFileModal) logFileModal.classList.remove('active');
        if (categoryModal) categoryModal.classList.remove('active');
        if (addCategoryModal) addCategoryModal.classList.remove('active');
        registerModal.classList.add('active');
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

    loginModal.classList.remove('active');
    registerModal.classList.remove('active');
    if (logFileModal) {
        logFileModal.classList.remove('active');
    }
    if (categoryModal) {
        categoryModal.classList.remove('active');
    }
    if (addCategoryModal) {
        addCategoryModal.classList.remove('active');
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
            rawlineModal!.classList.remove('active');
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
                rawlineModal!.classList.remove('active');
            }
        });
    }

    return rawlineModal;
}