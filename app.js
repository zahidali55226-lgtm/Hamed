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
                        <button class="buy-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Buy Now</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });

        // Add event listeners lazily to all newly created buttons
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productName = e.target.getAttribute('data-name');
                const productPrice = parseFloat(e.target.getAttribute('data-price'));
                handlePurchase(productName, productPrice);
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

    function handlePurchase(productName, productPrice) {
        const modalTitle = document.querySelector('.modal h2');
        const originalCloseBtn = document.getElementById('close-modal');
        
        // Set up Checkout UI
        modalTitle.textContent = 'Checkout 🛒';
        originalCloseBtn.style.display = 'none';

        modalMessage.innerHTML = `
            <div style="text-align: left; margin-bottom: 1.5rem;">
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-color);"><strong>Product:</strong> ${productName}</p>
                <p style="font-size: 1.1rem; color: var(--accent-color);"><strong>Price:</strong> ₹${productPrice}</p>
                
                <div style="margin-top: 1.5rem; background: rgba(0,0,0,0.03); padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-color);">Select Delivery Option:</label>
                    <select id="delivery-select" style="width: 100%; padding: 0.8rem; border-radius: 6px; border: 1px solid #cbd5e1; font-family: inherit; font-size: 1rem; color: var(--text-color); background: white;">
                        <option value="150">Standard Delivery (3-5 days) - ₹150</option>
                        <option value="300">Express Delivery (1-2 days) - ₹300</option>
                    </select>
                </div>

                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 1.2rem; font-weight: 700; color: var(--text-color);">Total Amount:</span>
                    <span id="total-price-display" style="font-size: 1.4rem; font-weight: 800; color: var(--primary-color);">₹${Math.round(productPrice + 150)}</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button id="cancel-checkout-btn" class="close-modal" style="flex: 1; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
                <button id="confirm-order-btn" class="submit-product-btn" style="flex: 2; margin: 0; padding: 0.8rem; border-radius: 8px;">Place Order</button>
            </div>
        `;

        modalOverlay.classList.add('active');

        // Logic for dropdown change
        const deliverySelect = document.getElementById('delivery-select');
        const totalDisplay = document.getElementById('total-price-display');
        
        deliverySelect.addEventListener('change', (e) => {
            const deliveryCharge = parseFloat(e.target.value);
            totalDisplay.textContent = '₹' + Math.round(productPrice + deliveryCharge);
        });

        // Cancel button
        document.getElementById('cancel-checkout-btn').addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                modalTitle.textContent = 'Thank You! 🎉';
                originalCloseBtn.style.display = 'block';
            }, 300);
        });

        // Confirm button
        document.getElementById('confirm-order-btn').addEventListener('click', () => {
            const selectedDelivery = deliverySelect.options[deliverySelect.selectedIndex].text;
            const finalTotal = totalDisplay.textContent;
            
            cartItems++;
            if (cartCount) cartCount.textContent = cartItems;
            
            // Show Success Message
            modalTitle.textContent = 'Order Confirmed! 🎉';
            modalMessage.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <p style="margin-bottom: 1rem; color: var(--text-color);">Aapka <strong>${productName}</strong> ka order confirm ho gaya hai!</p>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: left; font-size: 0.95rem; border: 1px solid #e2e8f0; color: var(--text-color);">
                        <p style="margin-bottom: 0.5rem;"><strong>Delivery:</strong> ${selectedDelivery.split(' - ')[0]}</p>
                        <p><strong>Total Paid:</strong> <span style="color: var(--primary-color); font-weight: 700;">${finalTotal}</span></p>
                    </div>
                    <p style="margin-top: 1rem; font-size: 0.9rem; color: #64748b;">Humaari team jald aapse raabta karegi.</p>
                </div>
            `;
            
            originalCloseBtn.style.display = 'block';
        });
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
