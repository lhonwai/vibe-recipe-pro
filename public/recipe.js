const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const results = document.getElementById('results');

searchBtn.addEventListener('click', searchRecipes);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchRecipes();
  }
});

async function searchRecipes() {
  const query = searchInput.value.trim();
  
  if (!query) {
    showError('Please enter an ingredient or recipe name');
    return;
  }

  showLoading();
  hideError();
  results.innerHTML = '';

  try {
    const response = await fetch(`/api/recipes?query=${encodeURIComponent(query)}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Recipe service is unavailable (status ${response.status}). Please try again later.`);
    }

    displayRecipes(data.results);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#999" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>'
);

function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    results.innerHTML = '<p class="no-results">No recipes found. Try a different search term.</p>';
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const imageUrl = recipe.image || PLACEHOLDER_IMAGE;
    const cookTime = recipe.readyInMinutes;
    const isQuickMeal = cookTime && cookTime <= 30;
    
    let metaContent = '';
    if (cookTime) {
      metaContent += `<span>⏱️ ${cookTime} min</span>`;
    }
    
    card.innerHTML = `
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(recipe.title)}" class="recipe-image">
      <div class="recipe-info">
        <h3 class="recipe-title">${escapeHtml(recipe.title)}</h3>
        <div class="recipe-meta">
          ${isQuickMeal ? '<span class="quick-meal-badge">Quick Meal</span>' : ''}
          ${metaContent}
        </div>
      </div>
    `;
    
    card.addEventListener('click', () => {
      const slug = recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      window.open(`https://spoonacular.com/recipes/${slug}-${recipe.id}`, '_blank', 'noopener');
    });
    
    results.appendChild(card);
  });
}

function showLoading() {
  loading.classList.remove('hidden');
}

function hideLoading() {
  loading.classList.add('hidden');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}
