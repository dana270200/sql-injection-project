// Control functions for modals
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Close modal when clicking outside the box
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeModals();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Bind Help Modal
    document.getElementById('navHelp').addEventListener('click', () => openModal('modalHelp'));
    document.getElementById('closeHelp').addEventListener('click', closeModals);

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('navLogout');
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            // Check if current session is in vulnerable mode based on URL or logic
            const isVulnerable = window.location.search.includes('vulnerable') || document.body.classList.contains('vuln-session');
            console.log(`isVulnerable: ${isVulnerable}`);
            // Redirect back to login while preserving the security mode
            if (isVulnerable) {
                window.location.href = 'login.html?mode=vulnerable';
            } else {
                window.location.href = 'login.html';
            }
        };
    }

    // Dynamic message based on time of day
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('heroGreeting');
    if (greetingEl) {
        if (hour < 12) greetingEl.textContent = 'Good morning,';
        else if (hour < 18) greetingEl.textContent = 'Good afternoon,';
        else greetingEl.textContent = 'Good evening,';
    }

    // Transfering money
    const transferBtn = document.getElementById('confirmTransfer');
    
    if (transferBtn) {
        transferBtn.onclick = async () => {
            const recipient = document.getElementById('recipientName').value.trim();
            const bank      = document.getElementById('bankNum').value.trim();
            const branch    = document.getElementById('branchNum').value.trim();
            const account   = document.getElementById('accountNum').value.trim();
            const amount    = parseFloat(document.getElementById('transferAmount').value);
            const errEl     = document.getElementById('tfError');
            const successEl = document.getElementById('tfSuccess');

            errEl.style.display = 'none';
            successEl.style.display = 'none';

            // Basic Input Validation
            if (!recipient || !bank || !branch || !account || !amount || amount <= 0) {
                errEl.textContent = 'Please fill in all fields correctly.';
                errEl.style.display = 'block';
                return;
            }

            const heroBalanceEl = document.getElementById('heroBalance');
            const currentBalance = parseFloat(heroBalanceEl.innerText.replace(/,/g, ''));

            if (amount > currentBalance) {
                errEl.textContent = 'Insufficient funds.';
                errEl.style.display = 'block';
                return;
            }

            // Send mock transfer request to server
            try {
                const res = await fetch('/transfer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from_name: document.getElementById('heroName').textContent,
                        amount,
                        target_account: `${recipient} | Bank: ${bank} | Branch: ${branch} | Acc: ${account}`,
                        current_balance: currentBalance
                    })
                });

                const data = await res.json();

                // Update UI with new balance returned from server
                const fmt = parseFloat(data.newBalance).toLocaleString('en-US', { minimumFractionDigits: 2 });
                heroBalanceEl.innerText = fmt;
                document.querySelectorAll('.balance-display').forEach(el => el.innerText = fmt);

                // Show success message
                successEl.innerHTML = `Transfer approved — ₪${amount.toLocaleString()} to ${recipient}`;
                successEl.style.display = 'block';

                // Clear input fields
                ['recipientName', 'bankNum', 'branchNum', 'accountNum', 'transferAmount'].forEach(id => {
                    document.getElementById(id).value = '';
                });
            } catch (error) {
                errEl.textContent = 'Connection error. Please try again.';
                errEl.style.display = 'block';
            }
        };
    }
});