document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const feedContainer = document.getElementById('feed-container');
    const savedItemsContainer = document.getElementById('saved-items-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const mainContent = document.getElementById('main-content');
    const searchInput = document.getElementById('search-input');
    const communityFeedContainer = document.getElementById('community-feed-container'); // <<< ADD THIS LINE
    // --- DOM Element References ---



    // --- Global State ---
    let allFeedData = typeof embeddedFeedData !== 'undefined' ? embeddedFeedData : [];
    let savedItemIds = [];

    // --- Masonry Instances Storage ---
    let masonryInstances = {}; // Store instances by container ID

    // --- Helper Functions ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Initializes or updates Masonry layout for a container.
     * @param {HTMLElement} container - The grid container element.
     */
    function initializeMasonry(container) {
        if (!container || !window.Masonry || !window.imagesLoaded) return; // Ensure libraries are loaded

        const containerId = container.id;

        // Use imagesLoaded to wait for images before initializing/layout
        imagesLoaded(container, function() {
            // Destroy previous instance for this container, if exists
            if (masonryInstances[containerId]) {
                try {
                    masonryInstances[containerId].destroy();
                } catch (e) { console.error('Error destroying masonry:', e); }
                delete masonryInstances[containerId];
            }

            // Create new Masonry instance
            try {
                 masonryInstances[containerId] = new Masonry(container, {
                    itemSelector: '.feed-item',
                    // columnWidth: 230, // Can explicitly set, or let it infer from item width CSS
                    gutter: 15,        // Horizontal space between items
                    percentPosition: true, // Recommended for smoother resizing
                    // fitWidth: true // Optional: Centers the grid horizontally
                });
                console.log(`Masonry initialized for ${containerId}`);
            } catch(e){
                 console.error(`Failed to initialize Masonry for ${containerId}:`, e);
            }
        });
    }

    /**
     * Destroys Masonry instance for a given container ID.
     * @param {string} containerId - The ID ('feed-container' or 'saved-items-container').
     */
     function destroyMasonryInstance(containerId) {
         if (masonryInstances[containerId]) {
             try {
                 masonryInstances[containerId].destroy();
             } catch (e) { console.error('Error destroying masonry:', e); }
             delete masonryInstances[containerId];
             console.log(`Masonry destroyed for ${containerId}`);
         }
     }


   /**
     * Creates the HTML structure for a single feed item.
     * Handles different content types (e.g., standard post, discussion).
     * @param {object} item - The feed item data.
     * @returns {HTMLElement} - The created feed item element.
     */
    /**
     * Creates the HTML structure for a single feed item.
     * Handles different content types (e.g., standard post, discussion).
     * @param {object} item - The feed item data.
     * @returns {HTMLElement} - The created feed item element.
     */
     function createFeedItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('feed-item'); // Base class for all items
        itemDiv.dataset.id = item.id;

        // --- Create Content Div FIRST and add common elements ---
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('feed-item-content');

        const title = document.createElement('h3');
        title.textContent = item.title;
        contentDiv.appendChild(title); // Add title to contentDiv

        // --- Append contentDiv to itemDiv EARLY ---
        // Do this BEFORE potentially inserting an image before it
        itemDiv.appendChild(contentDiv);
        // -----------------------------------------

        // --- Type-Specific Rendering ---
        if (item.contentType === 'discussion') {
            itemDiv.classList.add('feed-item--discussion'); // Add specific class

            // Add discussion body snippet if available (APPEND TO contentDiv)
            if (item.body) {
                const bodyP = document.createElement('p');
                bodyP.classList.add('discussion-body');
                bodyP.textContent = item.body;
                contentDiv.appendChild(bodyP); // Append to contentDiv
            }

            // Add discussion meta info (author, comments) (APPEND TO contentDiv)
            const metaDiv = document.createElement('div');
            metaDiv.classList.add('discussion-meta');

            if (item.author) {
                const authorSpan = document.createElement('span');
                authorSpan.classList.add('author');
                authorSpan.textContent = `By: ${item.author}`;
                metaDiv.appendChild(authorSpan);
            }

            if (typeof item.commentCount !== 'undefined') {
                const commentSpan = document.createElement('span');
                commentSpan.classList.add('comment-count');
                commentSpan.textContent = `💬 ${item.commentCount} Comments`;
                metaDiv.appendChild(commentSpan);
            }
            contentDiv.appendChild(metaDiv); // Append meta to contentDiv

        } else {
            // --- Standard Post Rendering (Image + Source) ---
            itemDiv.classList.add('feed-item--post'); // Optional specific class

            // Create Image Link (if image exists)
            if (item.imageUrl) {
                 const imgLink = document.createElement('a');
                 imgLink.href = item.link;
                 imgLink.target = "_blank";
                 imgLink.setAttribute('rel', 'noopener noreferrer');

                 const img = document.createElement('img');
                 img.src = item.imageUrl;
                 img.alt = item.title;
                 img.loading = 'lazy';
                 img.onerror = () => {
                     img.src = `https://placehold.co/300x200/eee/ccc?text=Image+Error`;
                     img.alt = 'Image loading error';
                 };
                 imgLink.appendChild(img);

                 // --- CORRECTED: Insert image link *before* contentDiv ---
                 // Now this works because contentDiv is already a child of itemDiv
                 itemDiv.insertBefore(imgLink, contentDiv);
                 // -------------------------------------------------------
            }

            // Source Info (Favicon + Domain) (APPEND TO contentDiv)
            const sourceDiv = document.createElement('div');
            sourceDiv.classList.add('feed-item-source');
            let domainName = 'Source';
            let faviconUrl = `https://placehold.co/16x16/eee/ccc?text=+`;
            try {
                const url = new URL(item.link);
                domainName = url.hostname.replace(/^www\./, '');
                faviconUrl = `https://www.google.com/s2/favicons?domain=${domainName}&sz=16`;
            } catch (e) { /* Keep defaults */ }

            const faviconImg = document.createElement('img');
            faviconImg.classList.add('favicon-img');
            faviconImg.src = faviconUrl;
            faviconImg.alt = `${domainName} favicon`;
            faviconImg.loading = 'lazy';
            faviconImg.onerror = (e) => { e.target.style.display = 'none'; };

            const domainSpan = document.createElement('span');
            domainSpan.classList.add('domain-name');
            domainSpan.textContent = domainName;

            sourceDiv.appendChild(faviconImg);
            sourceDiv.appendChild(domainSpan);
            contentDiv.appendChild(sourceDiv); // Append source info to contentDiv
        } // --- End Type-Specific Rendering ---


        // --- Common Elements ---
        // Save Button (common to all types) (APPEND TO itemDiv)
        const saveButton = document.createElement('button');
        saveButton.classList.add('save-button');
        saveButton.dataset.id = item.id;
        // Text content set by updateSaveButtonStates
        saveButton.addEventListener('click', handleSaveClick);
        itemDiv.appendChild(saveButton);

        // Card Click Listener (Adjusted for discussions)
        itemDiv.addEventListener('click', (e) => {
             if (!e.target.classList.contains('save-button')) {
                 if (item.link && item.link !== '#' && !item.link.startsWith('#discussion')) {
                      window.open(item.link, '_blank', 'noopener,noreferrer');
                 } else {
                      console.log("Discussion item clicked (no external link). ID:", item.id);
                 }
             }
        });

        return itemDiv;
    }

    /**
     * Renders items AND initializes/updates Masonry layout.
     */
    function renderItems(items, container) {
        if (!container) {
            console.error("Target container not provided or not found for rendering.");
            return;
        }

        // --- Destroy old Masonry instance BEFORE clearing HTML ---
        // This prevents errors if Masonry tries to access removed elements
        destroyMasonryInstance(container.id);

        container.innerHTML = ''; // Clear previous content AFTER destroying masonry

        if (!items || items.length === 0) {
            // Display appropriate message
            const isActiveSearch = searchInput && searchInput.value.trim() !== '';
            container.innerHTML = isActiveSearch ? '<p>No items match your search.</p>' : '<p>No items to display.</p>';
            // No need to initialize Masonry if empty
            return;
        }

        // Append new items (Important: Do this BEFORE initializing Masonry)
        items.forEach(item => {
            const itemElement = createFeedItemElement(item);
            container.appendChild(itemElement);
        });

        updateSaveButtonStates(); // Update buttons now that elements are in DOM

        // --- Initialize Masonry AFTER items are appended ---
        initializeMasonry(container);
    }

    function handleNavClick(event) {
        event.preventDefault();
        if (searchInput) searchInput.value = ''; // Clear search on tab change
    
        const targetTabId = event.target.dataset.tab;
    
        // Destroy Masonry instance of the tab we are LEAVING
        const currentActiveTab = document.querySelector('.tab-content.active');
        if (currentActiveTab) {
             const oldGrid = currentActiveTab.querySelector('.feed-grid');
             if (oldGrid) {
                 destroyMasonryInstance(oldGrid.id);
             }
         }
    
        navLinks.forEach(link => link.classList.remove('active'));
        event.target.classList.add('active');
    
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === targetTabId);
        });
    
        // Re-render content for the new tab - renderItems will handle Masonry init
        if (targetTabId === 'home-content') {
             renderItems(allFeedData, feedContainer);
        } else if (targetTabId === 'profile-content') {
            renderSavedItems();
        } else if (targetTabId === 'community-content') { // <<< --- ADD THIS ELSE IF BLOCK ---
            // Filter for discussion items
            const discussionItems = allFeedData.filter(item => item.contentType === 'discussion');
            // Render them into the community container
            renderItems(discussionItems, communityFeedContainer);
            // --- END OF ADDED BLOCK ---
        }
        // No action needed for other tabs (Videos, My Recipes) as they are static
    
        if (mainContent) mainContent.scrollTop = 0;
        window.scrollTo(0, 0);
    }

    function loadSavedItems() {
       // ... (Keep your existing function) ...
        const storedIds = localStorage.getItem('savedItemIds');
        savedItemIds = storedIds ? JSON.parse(storedIds) : [];
        if (!Array.isArray(savedItemIds)) {
            savedItemIds = [];
        }
    }

    function saveItemsToStorage() {
      // ... (Keep your existing function) ...
       localStorage.setItem('savedItemIds', JSON.stringify(savedItemIds));
    }

    function handleSaveClick(event) {
       // ... (Keep most of your existing function) ...
       event.stopPropagation();
        const button = event.target;
        const itemId = button.dataset.id;

        let itemWasSaved = savedItemIds.includes(itemId); // Check state *before* changing

        if (itemWasSaved) {
            savedItemIds = savedItemIds.filter(id => id !== itemId);
            button.textContent = 'Save';
            button.classList.remove('saved');
        } else {
            savedItemIds.push(itemId);
            button.textContent = 'Saved';
            button.classList.add('saved');
        }
        saveItemsToStorage();

        // If on profile tab, re-render/re-filter
        if (document.querySelector('#profile-content.active')) {
             // Re-render the saved items; renderItems will handle masonry update
             handleSearch(); // Use handleSearch as it filters or shows all saved items
        }
    }

     function updateSaveButtonStates() {
        // ... (Keep your existing function) ...
        const allSaveButtons = document.querySelectorAll('.save-button');
        allSaveButtons.forEach(button => {
            const itemId = button.dataset.id;
            if (savedItemIds.includes(itemId)) {
                button.textContent = 'Saved';
                button.classList.add('saved');
            } else {
                button.textContent = 'Save';
                button.classList.remove('saved');
            }
        });
    }

    function renderSavedItems() {
        const savedItems = allFeedData.filter(item => savedItemIds.includes(item.id));
        renderItems(savedItems, savedItemsContainer); // Calls renderItems which handles Masonry
    }

    function handleSearch() {
        if (!searchInput) return;
    
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeTabContent = document.querySelector('.tab-content.active');
    
        if (!activeTabContent) return;
    
        let baseData = []; // The full list of items for the current view BEFORE filtering
        let targetContainer = null;
    
        // Determine base data and container based on active tab
        if (activeTabContent.id === 'home-content') {
            baseData = allFeedData;
            targetContainer = feedContainer;
        } else if (activeTabContent.id === 'profile-content') {
            baseData = allFeedData.filter(item => savedItemIds.includes(item.id));
            targetContainer = savedItemsContainer;
        } else if (activeTabContent.id === 'community-content') { // <<< --- ADD THIS ELSE IF BLOCK ---
            // Base data for community tab is only discussion items
            baseData = allFeedData.filter(item => item.contentType === 'discussion');
            targetContainer = communityFeedContainer;
            // --- END OF ADDED BLOCK ---
        } else {
            return; // Search doesn't apply to other tabs
        }
    
        let filteredItems = baseData; // Default to the base list
    
        // Apply search filter if search term exists
        if (searchTerm) {
            filteredItems = baseData.filter(item =>
                // Only searching title for now
                item.title.toLowerCase().includes(searchTerm)
            );
        }
        // If searchTerm is empty, filteredItems remains the full baseData for the tab
    
        // Render the results (filtered or full base list)
        renderItems(filteredItems, targetContainer);
    }


    // --- Event Listeners Setup ---
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });
    } else {
         console.warn("No navigation links found.");
    }

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    } else {
         console.warn("Search input element not found.");
    }


    // --- Initial Page Load Logic ---
    if (allFeedData.length === 0 && typeof embeddedFeedData === 'undefined') {
         console.error("Feed data variable 'embeddedFeedData' is not defined in index.html or is empty.");
         if(feedContainer) feedContainer.innerHTML = '<p>Error loading feed data from HTML.</p>';
    } else {
        loadSavedItems();
        shuffleArray(allFeedData);
        // Initial render will now also initialize Masonry via initializeMasonry() called inside renderItems
        renderItems(allFeedData, feedContainer);
    }

}); // End of DOMContentLoaded listener