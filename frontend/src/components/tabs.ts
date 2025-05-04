export function setupTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const selectedTab = tab.getAttribute('data-tab');

            // Remove active class from all nav tabs
            navTabs.forEach(t => {
                t.classList.remove('active');
            });

            // Add active class to the clicked tab
            tab.classList.add('active');

            // Hide all panels
            tabPanels.forEach(panel => {
                panel.style.display = 'none';
            });

            // Show selected panel
            document.getElementById(`tab-${selectedTab}`)!.style.display = 'block';
        });
    });

    // Optional: Set the first tab as active by default when page loads
    const firstTab = navTabs[0];
    firstTab?.classList.add('active');
}