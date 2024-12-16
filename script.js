// استدعاء العناصر
const productForm = document.getElementById('productForm');
const productsList = document.getElementById('productsList');
const searchInput = document.getElementById('searchInput');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productDescription = document.getElementById('productDescription');

// تحميل المنتجات من localStorage
let products = JSON.parse(localStorage.getItem('products')) || [];
let editingIndex = -1;

// عرض المنتجات
function displayProducts(productsToShow = products) {
    productsList.innerHTML = '';
    if (productsToShow.length === 0) {
        productsList.innerHTML = '<div class="no-products">لا توجد منتجات</div>';
        return;
    }

    productsToShow.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">السعر: ${product.price} دينار</p>
                <p class="description">${product.description || 'لا يوجد وصف'}</p>
            </div>
            <div class="product-actions">
                <button class="btn-edit" onclick="startEdit(${index})">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn-delete" onclick="deleteProduct(${index})">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        `;
        productsList.appendChild(productCard);
    });
}

// حفظ في localStorage
function saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

// إضافة أو تعديل منتج
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // التحقق من الإدخال
    if (!validateForm()) {
        return;
    }

    const product = {
        name: productName.value.trim(),
        price: parseFloat(productPrice.value),
        description: productDescription.value.trim(),
        createdAt: editingIndex === -1 ? new Date().toISOString() : products[editingIndex].createdAt,
        updatedAt: new Date().toISOString()
    };

    if (editingIndex === -1) {
        // إضافة منتج جديد
        products.unshift(product); // إضافة في بداية المصفوفة
        showMessage('تم إضافة المنتج بنجاح!', 'success');
    } else {
        // تعديل منتج موجود
        products[editingIndex] = product;
        editingIndex = -1;
        document.querySelector('.btn-add').textContent = 'إضافة منتج';
        showMessage('تم تحديث المنتج بنجاح!', 'success');
    }

    saveToLocalStorage();
    displayProducts();
    productForm.reset();
});

// التحقق من صحة النموذج
function validateForm() {
    const name = productName.value.trim();
    const price = productPrice.value.trim();
    
    if (!name) {
        showMessage('يرجى إدخال اسم المنتج', 'error');
        productName.focus();
        return false;
    }
    
    if (!price) {
        showMessage('يرجى إدخال سعر المنتج', 'error');
        productPrice.focus();
        return false;
    }
    
    if (isNaN(price) || parseFloat(price) <= 0) {
        showMessage('يرجى إدخال سعر صحيح', 'error');
        productPrice.focus();
        return false;
    }
    
    return true;
}

// بدء عملية التعديل
function startEdit(index) {
    const product = products[index];
    productName.value = product.name;
    productPrice.value = product.price;
    productDescription.value = product.description || '';
    editingIndex = index;
    
    const addButton = document.querySelector('.btn-add');
    addButton.textContent = 'تحديث المنتج';
    addButton.classList.add('editing');
    
    productName.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// حذف منتج
function deleteProduct(index) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        products.splice(index, 1);
        saveToLocalStorage();
        displayProducts();
        
        if (editingIndex === index) {
            productForm.reset();
            editingIndex = -1;
            document.querySelector('.btn-add').textContent = 'إضافة منتج';
        }
        
        showMessage('تم حذف المنتج بنجاح!', 'success');
    }
}

// دالة البحث في المنتجات
function searchProducts(searchTerm) {
    searchTerm = searchTerm.toLowerCase().trim();
    
    if (!searchTerm) {
        displayProducts(products);
        return;
    }

    const filteredProducts = products.filter(product => {
        const name = product.name.toLowerCase();
        const description = (product.description || '').toLowerCase();
        const price = product.price.toString();

        return name.includes(searchTerm) || 
               description.includes(searchTerm) || 
               price.includes(searchTerm);
    });

    displayProducts(filteredProducts);

    if (filteredProducts.length === 0) {
        productsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>لا توجد نتائج للبحث عن "${searchTerm}"</p>
            </div>
        `;
    }
}

// إضافة مستمع الحدث للبحث
searchInput.addEventListener('input', (e) => {
    searchProducts(e.target.value);
});

// عرض الرسائل التفاعلية
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${text}</span>
    `;
    document.body.appendChild(message);

    setTimeout(() => message.classList.add('show'), 10);
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// ترتيب المنتجات
function sortProducts(criteria) {
    switch(criteria) {
        case 'name':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'date':
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    displayProducts();
}

// إضافة CSS للرسائل التفاعلية
const messageStyles = document.createElement('style');
messageStyles.textContent = `
    .message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }

    .message.show {
        transform: translateX(0);
    }

    .message.success {
        background-color: var(--primary-color);
    }

    .message.error {
        background-color: var(--danger-color);
    }

    .message i {
        font-size: 1.2em;
    }

    .no-products {
        text-align: center;
        padding: 2rem;
        color: #666;
        font-size: 1.2em;
    }

    .btn-add.editing {
        background-color: var(--secondary-color);
    }
`;
document.head.appendChild(messageStyles);

// عرض المنتجات عند تحميل الصفحة
displayProducts();