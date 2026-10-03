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
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch recipes');
    }

    displayRecipes(data.results);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    results.innerHTML = '<p class="no-results">No recipes found. Try a different search term.</p>';
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const imageUrl = recipe.image || 'https://via.placeholder.com/400x300?text=No+Image';
    const cookTime = recipe.readyInMinutes;
    const isQuickMeal = cookTime && cookTime <= 30;
    
    let metaContent = '';
    if (cookTime) {
      metaContent += `<span>⏱️ ${cookTime} min</span>`;
    }
    
    card.innerHTML = `
      <img src="${imageUrl}" alt="${recipe.title}" class="recipe-image">
      <div class="recipe-info">
        <h3 class="recipe-title">${recipe.title}</h3>
        <div class="recipe-meta">
          ${isQuickMeal ? '<span class="quick-meal-badge">Quick Meal</span>' : ''}
          ${metaContent}
        </div>
      </div>
    `;
    
    card.addEventListener('click', () => {
      window.open(`https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-')}-${recipe.id}`, '_blank');
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
