import { writable, derived } from 'svelte/store';
import { toolRegistry, categories } from '$lib/tools/registry.js';

// Safe localStorage helper
function getStoredJson(key, defaultVal) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStoredJson(key, val) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

export const activeToolId = writable('gradient-generator');
export const searchQuery = writable('');
export const activeCategory = writable('all');
export const currentView = writable('grid'); // 'grid' | 'tool'

export const favorites = writable(getStoredJson('pixelkit_favorites', ['gradient-generator', 'gsap-playground', 'frame-extractor']));

favorites.subscribe(val => {
  setStoredJson('pixelkit_favorites', val);
});

export function toggleFavorite(toolId) {
  favorites.update(favs => {
    if (favs.includes(toolId)) {
      return favs.filter(id => id !== toolId);
    } else {
      return [...favs, toolId];
    }
  });
}

export function openTool(toolId) {
  const tool = toolRegistry.find(t => t.id === toolId);
  if (tool) {
    activeToolId.set(toolId);
    activeCategory.set(tool.category);
  }
  currentView.set('tool');
}

export function openCategory(categoryId) {
  activeCategory.set(categoryId);
  currentView.set('grid');
}

export function backToGrid() {
  currentView.set('grid');
}

// When searching, auto-switch to grid view to display matches
searchQuery.subscribe(q => {
  if (q && q.trim().length > 0) {
    currentView.set('grid');
  }
});

// Filtered tools derived store
export const filteredTools = derived(
  [searchQuery, activeCategory, favorites],
  ([$searchQuery, $activeCategory, $favorites]) => {
    let list = toolRegistry;
    if ($activeCategory === 'favorites') {
      list = list.filter(t => $favorites.includes(t.id));
    } else if ($activeCategory !== 'all') {
      list = list.filter(t => t.category === $activeCategory);
    }
    if ($searchQuery.trim()) {
      const q = $searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }
);

