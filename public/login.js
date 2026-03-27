// Control functions for modals
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Close modal when clicking outside the popup
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeModals();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('loginForm');
    const toast = document.getElementById('toast');
    const idInput = document.querySelector('input[name="id_number"]');
    
    // Bind Support and Terms Modal
    document.getElementById('navSupport').addEventListener('click', () => openModal('modalSupport'));
    document.getElementById('navTerms').addEventListener('click', () => openModal('modalTerms'));
    
    // Bind explicit close buttons inside modals
    document.getElementById('closeSupport').addEventListener('click', closeModals);
    document.getElementById('closeTerms').addEventListener('click', closeModals);
    
    // Invisible buttons
    const vulnBtn   = document.getElementById('vulnerable-trigger');
    const secureBtn = document.getElementById('secure-trigger');
    
    // System State (Default: Secure)
    let isSecureMode = true; 

    // Check URL parameters for errors, last ID, and persistent security mode
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle persistent security mode after logout or redirect
    if (urlParams.get('mode') === 'vulnerable') {
        isSecureMode = false;
        form.action = '/login-vulnerable';
    }

    if (urlParams.get('last_id')) {
        idInput.value = urlParams.get('last_id');
    }
    
    if (urlParams.get('error') === '1') {
        document.getElementById('login-error').style.display = 'block';
    }

    // --- Presenter Toggles ---
    vulnBtn.addEventListener('click', () => {
        // Check if already in vulnerable mode
        if (isSecureMode === false) {
            showToast('⚠️ Already in Vulnerable Mode', false);
            return; // Stop execution here
        }
        
        isSecureMode = false;
        form.action = '/login-vulnerable';
        showToast('🔓 Security Mode: OFF', false);
    });

    secureBtn.addEventListener('click', () => {
        // Check if already in secure mode
        if (isSecureMode === true) {
            showToast('✅ Already in Secure Mode', true);
            return; // Stop execution here
        }
        
        isSecureMode = true;
        form.action = '/login-secure';
        showToast('🔒 Security Mode: ON', true);
    });

    // --- Utility Functions ---
    // Displays the temporary notification toast
    function showToast(message, isSecure) {
        toast.textContent = message;
        toast.style.borderLeft = isSecure ? '5px solid #28a745' : '5px solid #d91c24';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
});