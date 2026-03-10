document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const cartCount = document.getElementById('cart-count');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const modalMessage = document.getElementById('modal-message');
    const dataUpload = document.getElementById('data-upload');
    
    // Form elements
    const addProductForm = document.getElementById('add-product-form');
    const exportDataBtn = document.getElementById('export-data-btn');

    // Profile & Page elements
    const profileBtn = document.getElementById('profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const heroSection = document.getElementById('hero-section');
    const mainShop = document.getElementById('main-shop');
    const profileContainer = document.getElementById('profile-container');
    
    let cartItems = 0;
    
    // Initialize from LocalStorage to keep items across different pages (index.html & profile.html)
    let storedProducts = localStorage.getItem('ahmadStoreProducts');
    let currentProducts = storedProducts ? JSON.parse(storedProducts) : ((typeof tshirts !== 'undefined') ? [...tshirts] : []);

    // tshirts array 'data.js' se load ho raha hai by default
    function renderProducts(productsData = currentProducts) {
        if (!productGrid) return;
        
        productGrid.innerHTML = '';
        currentProducts = productsData;
        
        currentProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">₹${product.price}</span>
                        <button class="buy-btn" data-id="${product.id}" data-name="${product.name}">Buy Now</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });

        // Add event listeners lazily to all newly created buttons
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productName = e.target.getAttribute('data-name');
                handlePurchase(productName);
            });
        });
    }

    // Store original dataset separately so we can filter consistently
    let allStoreProducts = [...currentProducts];

    // Handle Filters
    const filterContainer = document.getElementById('filter-container');
    if (filterContainer) {
        const filterBtns = filterContainer.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                const clickedBtn = e.target;
                clickedBtn.classList.add('active');
                
                const category = clickedBtn.getAttribute('data-category');
                
                if (category === 'all') {
                    renderProducts(allStoreProducts);
                } else {
                    const filtered = allStoreProducts.filter(p => p.category === category);
                    renderProducts(filtered);
                }
            });
        });
    }

    function handlePurchase(productName) {
        cartItems++;
        cartCount.textContent = cartItems;
        
        // Purchase Success Message
        modalMessage.innerHTML = `Aapne <strong>${productName}</strong> successfully purchase kar li hai!`;
        modalOverlay.classList.add('active');
    }

    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    // Close modal when clicked outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });

    // Handle JSON Data Upload
    if (dataUpload) {
        dataUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    if (Array.isArray(jsonData)) {
                        renderProducts(jsonData);
                        alert('Data successfully loaded!');
                    } else {
                        alert('File format is incorrect. It should be an array of products.');
                    }
                } catch (err) {
                    alert('Error parsing JSON file. Please provide a valid JSON.');
                }
            };
            reader.readAsText(file);
        });
    }

    // Load Contact Info if available
    function renderContactInfo() {
        if (typeof contactInfo !== 'undefined') {
            const phoneEl = document.getElementById('contact-phone');
            const phoneText = document.getElementById('phone-text');
            const whatsappEl = document.getElementById('contact-whatsapp');
            const facebookEl = document.getElementById('contact-facebook');
            
            if (phoneEl) {
                phoneEl.href = `tel:${contactInfo.phone}`;
                phoneText.textContent = contactInfo.phone;
            }
            if (whatsappEl) {
                // Remove spaces and special characters from WhatsApp number for the link to work
                const waNumber = contactInfo.whatsapp.replace(/[^0-9]/g, '');
                whatsappEl.href = `https://wa.me/${waNumber}`;
            }
            if (facebookEl) {
                facebookEl.href = contactInfo.facebook;
            }
            
            // Set for floating icon
            const floatWaEl = document.getElementById('floating-whatsapp');
            if (floatWaEl) {
                const waNumber = contactInfo.whatsapp.replace(/[^0-9]/g, '');
                floatWaEl.href = `https://wa.me/${waNumber}`;
            }
        }
        
        if (typeof bankInfo !== 'undefined') {
            const epName = document.getElementById('easypaisa-name');
            const epNo = document.getElementById('easypaisa-no');
            const jcName = document.getElementById('jazzcash-name');
            const jcNo = document.getElementById('jazzcash-no');
            const bankName = document.getElementById('bank-name');
            const bankNo = document.getElementById('bank-no');
            
            if(epName) epName.textContent = `Name: ${bankInfo.easypaisa.accountName}`;
            if(epNo) epNo.textContent = `No: ${bankInfo.easypaisa.accountNumber}`;
            
            if(jcName) jcName.textContent = `Name: ${bankInfo.jazzcash.accountName}`;
            if(jcNo) jcNo.textContent = `No: ${bankInfo.jazzcash.accountNumber}`;
            
            if(bankName) bankName.textContent = `Name: ${bankInfo.bankAccount.accountName}`;
            if(bankNo) bankNo.textContent = `IBAN: ${bankInfo.bankAccount.iban}`;
        }
    }

    // Handle Image Name Preview
    const newImageFile = document.getElementById('new-image-file');
    const fileNameDisplay = document.getElementById('file-name-display');

    if (newImageFile) {
        newImageFile.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                fileNameDisplay.textContent = this.files[0].name;
            } else {
                fileNameDisplay.textContent = 'No picture chosen';
            }
        });
    }

    // Handle adding a new product
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fileInput = document.getElementById('new-image-file');
            const file = fileInput.files[0];
            
            if (!file) {
                alert("Please select a picture first!");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const newProduct = {
                    id: Date.now(), // Generate a unique ID
                    name: document.getElementById('new-name').value,
                    price: parseInt(document.getElementById('new-price').value),
                    category: document.getElementById('new-category') ? document.getElementById('new-category').value : 'other',
                    image: event.target.result, // base64 image data
                    description: document.getElementById('new-desc').value,
                };

                // Add the product to the start of the list
                currentProducts.unshift(newProduct);
                
                // Save to local storage so it persists across pages
                localStorage.setItem('ahmadStoreProducts', JSON.stringify(currentProducts));
                
                // Re-render the UI
                renderProducts(currentProducts);
                
                // Reset the form
                addProductForm.reset();
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = 'No picture chosen';
                }
                
                // Show Success Notification
                modalMessage.innerHTML = `<strong>${newProduct.name}</strong> successfully store mein add ho gayi hai! <br><br> <em>Note: Ise hamesha ke liye save karne ke liye "Save Data File" button dabayein.</em>`;
                modalOverlay.classList.add('active');
            };
            
            // Read the image file as a Data URL
            reader.readAsDataURL(file);
        });
    }

    // Handle Exporting Data to JSON File
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            const dataStr = JSON.stringify(currentProducts, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = "my-ahmad-store-data.json";
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    // Run Initialization
    renderProducts();
    renderContactInfo();
});
