export function setupTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const selectedTab = tab.getAttribute('data-tab');

            // Hide all panels
            tabPanels.forEach(panel => {
                panel.style.display = 'none';
            });

            // Show selected panel
            document.getElementById(`tab-${selectedTab}`)!.style.display = 'block';
        });
    });
}