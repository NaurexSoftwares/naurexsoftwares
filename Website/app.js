const CONFIG_URL = 'https://raw.githubusercontent.com/NaurexSoftwares/naurexsoftwares/refs/heads/NaurexSoftwares-wb/wsf20395/config.json';
let globalSoftwareData = []; 
let studioName = "Naurex Softwares";

async function initializePlatform() {
    const loader = document.getElementById('loader');
    
    try {
        const response = await fetch(CONFIG_URL);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const data = await response.json();
        globalSoftwareData = data.softwares;
        studioName = data.studio_name; 
        
        document.getElementById('hero-subtitle').textContent = "Providing advanced utilities and environments tailored for Windows architecture.";

        loader.classList.add('hidden');
        
        setupSearch();
        window.addEventListener('hashchange', handleRoute);
        handleRoute();

    } catch (error) {
        console.error("Platform Initialization Error:", error);
        loader.innerHTML = `<p style="color: #ef4444; font-family: monospace;">[ERROR] Failed to fetch ecosystem configuration.<br>${error.message}</p>`;
    }
}

function handleRoute() {
    const hash = window.location.hash.substring(1); 
    if (hash) {
        const software = globalSoftwareData.find(s => s.id === hash);
        if (software) {
            showSoftwareDetails(software); 
        } else {
            showMainView(); 
        }
    } else {
        showMainView(); 
    }
}

function renderGrid(softwares) {
    const container = document.getElementById('software-container');
    const noResults = document.getElementById('no-results');
    container.innerHTML = ''; 
    
    if (softwares.length === 0) {
        container.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    noResults.classList.add('hidden');

    softwares.forEach(software => {
        const tagsHtml = software.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');
        
        // Lógica para o texto do botão no card
        const buttonText = (software.paid === true || software.paid === "true") ? 'Buy Project' : 'View Details';
        
        const card = document.createElement('div');
        card.className = 'software-card';
        card.innerHTML = `
            <div class="card-top">
                <img src="${software.icon}" alt="${software.name} Icon" class="software-icon" onerror="this.src='icon.png'">
                <span class="version-badge">v${software.version}</span>
            </div>
            <div class="software-info">
                <h3>${software.name}</h3>
                <p>${software.description}</p>
            </div>
            <div class="card-footer">
                <div class="tags-container">${tagsHtml}</div>
                <button class="card-action">${buttonText}</button>
            </div>
        `;
        
        card.onmousemove = e => {
            const rect = card.getBoundingClientRect(),
                  x = e.clientX - rect.left,
                  y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        };

        card.addEventListener('click', () => {
            window.location.hash = software.id; 
        });

        container.appendChild(card);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filteredData = globalSoftwareData.filter(software => {
            const isInvisible = software.invisible === true || software.invisible === "true";
            if (isInvisible) return false;
            return software.name.toLowerCase().includes(term) || 
                   software.description.toLowerCase().includes(term) || 
                   software.tags.some(tag => tag.toLowerCase().includes(term));
        });
        renderGrid(filteredData);
    });
}

function showSoftwareDetails(software) {
    document.title = `${software.name} | ${studioName}`;
    const mainView = document.getElementById('main-view');
    const detailView = document.getElementById('detail-view');
    mainView.classList.add('hidden');
    detailView.classList.remove('hidden');
    window.scrollTo(0, 0); 

    const featuresHtml = software.features 
        ? `<ul class="feature-list">${software.features.map(f => `<li>${f}</li>`).join('')}</ul>`
        : `<p style="color: var(--text-secondary)">No specific features listed.</p>`;

    const tagsHtml = software.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');

    // Lógica para o texto do botão principal de ação
    const mainActionText = (software.paid === true || software.paid === "true") ? 'Buy Project' : 'Download Project';

    detailView.innerHTML = `
        <button class="back-btn" onclick="window.location.hash=''">
            ← Back to Products
        </button>
        <div class="detail-header">
            <img src="${software.icon}" alt="${software.name}" class="detail-icon" onerror="this.src='icon.png'">
            <div class="detail-title">
                <h2>${software.name}</h2>
                <span class="version">Version ${software.version}</span>
            </div>
        </div>
        <div class="detail-content">
            <div class="detail-desc">
                <h3>Overview</h3>
                <p>${software.long_description || software.description}</p>
                <h3>Key Features</h3>
                ${featuresHtml}
            </div>
            <div class="detail-sidebar">
                <h4>Information</h4>
                <div class="tags-container" style="margin-bottom: 2rem;">
                    ${tagsHtml}
                </div>
                <a href="${software.download_link}" target="_blank" class="btn-primary" style="width: 100%; text-align: center; display: block;">
                    ${mainActionText}
                </a>
            </div>
        </div>
    `;
}

function showMainView() {
    document.title = `${studioName} | Software Ecosystem`;
    document.getElementById('main-view').classList.remove('hidden');
    document.getElementById('detail-view').classList.add('hidden');
    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.value = '';
    const visibleSoftwares = globalSoftwareData.filter(software => 
        !(software.invisible === true || software.invisible === "true")
    );
    renderGrid(visibleSoftwares);
    window.scrollTo(0, 0);
}

document.getElementById('nav-home').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = ''; 
});

document.addEventListener('DOMContentLoaded', initializePlatform);