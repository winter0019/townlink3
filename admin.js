const adminKeyInput = document.getElementById('admin-key-input');
const submitAdminKeyButton = document.getElementById('submit-admin-key-button');
const pendingBusinessesList = document.getElementById('pending-businesses-list');
const adminFeedback = document.getElementById('admin-feedback');
const pendingBusinessesSection = document.getElementById('pending-businesses-section');
const adminKeyForm = document.getElementById('admin-key-form');

adminKeyForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // prevent form from reloading page
  const adminKey = adminKeyInput.value.trim();

  if (!adminKey) {
    showFeedback('Please enter the admin key.');
    return;
  }

  showFeedback('Loading businesses...', 'blue');
  await fetchPendingBusinesses(adminKey);
});

function showFeedback(message, color = 'red') {
  adminFeedback.textContent = message;
  adminFeedback.classList.remove('hidden');
  adminFeedback.classList.remove('text-red-600', 'text-blue-600');
  adminFeedback.classList.add(color === 'red' ? 'text-red-600' : 'text-blue-600');
}

async function fetchPendingBusinesses(adminKey) {
  try {
    const response = await fetch('https://townlink-api.onrender.com/admin/pending-businesses', {
      method: 'GET',
      headers: {
        'x-admin-key': adminKey,
      }
    });

    if (response.status === 403) {
      showFeedback('Invalid Admin Key.');
      pendingBusinessesSection.classList.add('hidden');
      return;
    }

    if (!response.ok) {
      showFeedback('Server error. Please try again later.');
      pendingBusinessesSection.classList.add('hidden');
      return;
    }

    const businesses = await response.json();

    if (businesses.length === 0) {
      showFeedback('No pending businesses at the moment.');
      pendingBusinessesSection.classList.add('hidden');
      return;
    }

    adminFeedback.classList.add('hidden'); // hide feedback message
    pendingBusinessesList.innerHTML = ''; // clear existing list
    pendingBusinessesSection.classList.remove('hidden'); // show pending section

    businesses.forEach(business => {
      const businessCard = document.createElement('li');
      businessCard.className = 'bg-white rounded-lg shadow p-4';

      businessCard.innerHTML = `
        <h3 class="text-lg font-bold">${business.name}</h3>
        <p><strong>Category:</strong> ${business.category}</p>
        <p><strong>Description:</strong> ${business.description}</p>
        <p><strong>Contact:</strong> ${business.contact}</p>
        <p><strong>Location:</strong> ${business.location}</p>
        <button class="approve-btn bg-green-500 text-white px-4 py-2 rounded mt-2 mr-2">Approve</button>
        <button class="delete-btn bg-red-500 text-white px-4 py-2 rounded mt-2">Delete</button>
      `;

      businessCard.querySelector('.approve-btn').addEventListener('click', async () => {
        try {
          const approveResponse = await fetch(`https://townlink-api.onrender.com/admin/approve-business/${business._id}`, {
            method: 'PUT',
            headers: {
              'x-admin-key': adminKey,
            }
          });

          if (approveResponse.ok) {
            alert('Business approved!');
            await fetchPendingBusinesses(adminKey);
          } else {
            alert('Failed to approve business.');
          }
        } catch {
          alert('Error approving business.');
        }
      });

      businessCard.querySelector('.delete-btn').addEventListener('click', async () => {
        try {
          const deleteResponse = await fetch(`https://townlink-api.onrender.com/admin/delete-business/${business._id}`, {
            method: 'DELETE',
            headers: {
              'x-admin-key': adminKey,
            }
          });

          if (deleteResponse.ok) {
            alert('Business deleted!');
            await fetchPendingBusinesses(adminKey);
          } else {
            alert('Failed to delete business.');
          }
        } catch {
          alert('Error deleting business.');
        }
      });

      pendingBusinessesList.appendChild(businessCard);
    });

  } catch (error) {
    showFeedback('Network error. Please check your connection.');
    pendingBusinessesSection.classList.add('hidden');
  }
}
