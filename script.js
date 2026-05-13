const products = [
    {
        id: 1,
        name: 'Neumann Hazai Mez 2025/26',
        team: 'Neumann János SC',
        category: 'Hazai',
        price: 14100,
        image: 'hazaimez.png',
        badge: 'Bestseller',
        description: 'A Neumann János SC hivatalos hazai meze a 2025/26-os szezonra. Lila-fehér design, légáteresztő anyag.'
    },
    {
        id: 2,
        name: 'Neumann Idegenbeli Mez 2025/26',
        team: 'Neumann János SC',
        category: 'Idegenbeli',
        price: 12990,
        image: 'vendegmez.png',
        badge: 'Új',
        description: 'A Neumann János SC idegenbeli meze a 2025/26-os szezonra. Sárga-fekete különleges mintával.'
    },
    {
        id: 3,
        name: 'Neumann Edzőmez',
        team: 'Neumann János SC',
        category: 'Edzőmez',
        price: 8990,
        image: 'edzomez.png',
        badge: '',
        description: 'Könnyű és légáteresztő hosszú ujjú edzőmez fekete-lila mintával.'
    },
    {
        id: 4,
        name: 'Neumann Kapusmez',
        team: 'Neumann János SC',
        category: 'Kapusmez',
        price: 5300,
        image: 'kapusmez.png',
        badge: '',
        description: 'A kapusnak tervezett speciális mez fekete-lila technikai dizájnnal.'
    },
    {
        id: 5,
        name: 'Neumann Különleges Kiadás',
        team: 'Neumann János SC',
        category: 'Különleges',
        price: 15990,
        image: 'kulonlegesmez.png',
        badge: 'Limitált',
        description: 'Limitált különleges kiadású mez arany részletekkel és egyedi dizájnnal.'
    },
    {
        id: 6,
        name: 'Neumann Retró Mez',
        team: 'Neumann János SC',
        category: 'Retró',
        price: 9990,
        image: 'retromez.png',
        badge: '',
        description: 'A csapat klasszikus retró dizájnja modern, légáteresztő anyagból.'
    }
];

const fakePlayers = [
    { name: 'Kiss Marcell', number: 9 },
    { name: 'Nagy Benett', number: 10 },
    { name: 'Toth Levente', number: 7 },
    { name: 'Varga Dominik', number: 11 },
    { name: 'Fodor Patrik', number: 5 },
    { name: 'Szabo Noel', number: 14 },
    { name: 'Krisztiánó Ronáldó', number: 67 }
];

function normalizeCart(rawCart) {
    if (!Array.isArray(rawCart)) {
        return [];
    }

    return rawCart
        .map(function(item) {
            if (!item || typeof item.id !== 'number') {
                return null;
            }

            const product = products.find(function(p) {
                return p.id === item.id;
            });

            if (!product) {
                return null;
            }

            const quantity = Number.isFinite(item.quantity)
                ? Math.max(1, Math.floor(item.quantity))
                : 1;

            return {
                id: product.id,
                name: product.name,
                price: Number.isFinite(item.price) ? item.price : product.price,
                image: product.image,
                category: product.category,
                quantity: quantity,
                configKey: item.configKey || 'base',
                optionSummary: item.optionSummary || '',
                size: item.size || '',
                badgeOption: item.badgeOption || '',
                playerOption: item.playerOption || ''
            };
        })
        .filter(Boolean);
}

function getCart() {
    const rawCart = JSON.parse(localStorage.getItem('cart')) || [];
    const normalized = normalizeCart(rawCart);

    if (JSON.stringify(rawCart) !== JSON.stringify(normalized)) {
        localStorage.setItem('cart', JSON.stringify(normalized));
    }

    return normalized;
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(normalizeCart(cart)));
    updateCartCount();
}

function addCartItem(entry, quantityToAdd) {
    const cart = getCart();
    const quantity = Math.max(1, Math.floor(quantityToAdd || 1));

    const existingItem = cart.find(function(item) {
        return item.id === entry.id && item.configKey === entry.configKey;
    });

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: entry.id,
            name: entry.name,
            price: entry.price,
            image: entry.image,
            category: entry.category,
            quantity: quantity,
            configKey: entry.configKey || 'base',
            optionSummary: entry.optionSummary || '',
            size: entry.size || '',
            badgeOption: entry.badgeOption || '',
            playerOption: entry.playerOption || ''
        });
    }

    saveCart(cart);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce(function(sum, item) {
        return sum + item.quantity;
    }, 0);
    const cartCount = document.getElementById('cart-count');

    if (cartCount) {
        cartCount.textContent = count;
    }
}

function addToCart(id) {
    const product = products.find(function(p) {
        return p.id === id;
    });

    if (product) {
        addCartItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            configKey: 'base',
            optionSummary: 'Alap konfiguráció'
        }, 1);
        showToast(product.name + ' sikeresen a kosárba került.', 'success');
    }
}

function addToCartFromCard(event, id) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    addToCart(id);
    return false;
}

function openProduct(id) {
    window.location.href = 'termek.html?id=' + id;
}

function showToast(message, type) {
    const existingContainer = document.getElementById('toast-container');
    const container = existingContainer || document.createElement('div');

    if (!existingContainer) {
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.textContent = message;

    container.appendChild(toast);

    // Ensure visibility even if requestAnimationFrame is delayed.
    toast.classList.add('toast-visible');

    requestAnimationFrame(function() {
        toast.classList.add('toast-visible');
    });

    setTimeout(function() {
        toast.classList.add('toast-visible');
    }, 20);

    setTimeout(function() {
        toast.classList.remove('toast-visible');
        setTimeout(function() {
            toast.remove();
        }, 220);
    }, 2800);
}

function renderProducts(containerId, list = products) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = '';

    list.forEach(function(product) {
        let imageHtml = '<i class="fas fa-tshirt"></i>';

        if (product.image !== '') {
            imageHtml =
                '<img src="' + product.image + '" alt="' + product.name +
                '" style="width:100%;height:100%;object-fit:contain;background:#f8fafc;padding:6px;">';
        }

        container.innerHTML += `
            <div class="product-card clickable-card" data-product-id="${product.id}" tabindex="0">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <div class="product-image">
                    ${imageHtml}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="team-label">${product.category || product.team}</div>
                    <div class="price">${product.price.toLocaleString()} Ft</div>
                </div>
            </div>
        `;
    });

    container.querySelectorAll('.product-card.clickable-card').forEach(function(card) {
        const id = Number(card.dataset.productId);

        card.addEventListener('click', function() {
            openProduct(id);
        });

        card.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                openProduct(id);
            }
        });
    });

    container.querySelectorAll('.add-cart-btn').forEach(function(button) {
        const id = Number(button.dataset.productId);

        button.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            addToCart(id);
        });
    });
}

function renderProductDetail() {
    const container = document.getElementById('product-detail');

    if (!container) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));

    const product = products.find(function(p) {
        return p.id === id;
    });

    if (!product) {
        container.innerHTML = '<p>A termék nem található.</p>';
        return;
    }

    let imageHtml = '<i class="fas fa-tshirt" style="font-size:5rem;opacity:0.2;color:#a855f7;"></i>';

    if (product.image !== '') {
        imageHtml =
            '<img src="' + product.image + '" alt="' + product.name +
            '" style="width:100%;height:100%;object-fit:contain;background:#f8fafc;padding:12px;">';
    }

    const playerOptions = fakePlayers.map(function(player) {
        return `<option value="${player.name}#${player.number}">${player.name} #${player.number}</option>`;
    }).join('');

    container.innerHTML = `
        <section class="pd-layout">
            <div class="pd-gallery">
                <div class="pd-main-image product-image">${imageHtml}</div>
            </div>
            <div class="pd-config-card">
                <h1>${product.name}</h1>
                <div class="pd-price" id="pd-price">${product.price.toLocaleString()} Ft</div>

                <div class="pd-group">
                    <div class="pd-label-row">
                        <span>Méret</span>
                    </div>
                    <div class="chip-group" id="size-group">
                        <button type="button" class="chip active" data-value="XS" data-extra="0">XS</button>
                        <button type="button" class="chip" data-value="S" data-extra="0">S</button>
                        <button type="button" class="chip" data-value="M" data-extra="0">M</button>
                        <button type="button" class="chip" data-value="L" data-extra="0">L</button>
                        <button type="button" class="chip" data-value="XL" data-extra="1200">XL +1200 Ft</button>
                    </div>
                </div>

                <div class="pd-group">
                    <div class="pd-label-row">
                        <span>Matrica</span>
                    </div>
                    <div class="chip-group" id="badge-group">
                        <button type="button" class="chip active" data-value="Nincs" data-extra="0">Nincs</button>
                        <button type="button" class="chip" data-value="Heves Liga" data-extra="1500">Heves Liga +1500 Ft</button>
                        <button type="button" class="chip" data-value="Bajnokok Pecset" data-extra="2500">Bajnokok Pecsét +2500 Ft</button>
                    </div>
                </div>

                <div class="pd-group">
                    <div class="pd-label-row">
                        <span>Játékos név és szám</span>
                    </div>
                    <div class="chip-group" id="name-group">
                        <button type="button" class="chip active" data-value="none" data-extra="0">Nincs</button>
                        <button type="button" class="chip" data-value="player" data-extra="3000">Játékos +3000 Ft</button>
                        <button type="button" class="chip" data-value="custom" data-extra="4500">Saját név/szám +4500 Ft</button>
                    </div>

                    <div class="pd-extra-block" id="player-select-wrap" style="display:none;">
                        <select id="fake-player-select">
                            ${playerOptions}
                        </select>
                    </div>

                    <div class="pd-extra-block pd-custom-grid" id="custom-wrap" style="display:none;">
                        <input type="text" id="custom-name" maxlength="18" placeholder="Saját név (pl. KELEMEN)">
                        <input type="number" id="custom-number" min="1" max="99" placeholder="Szám (1-99)">
                    </div>
                </div>

                <div class="pd-group">
                    <div class="pd-label-row">
                        <span>Darabszám</span>
                    </div>
                    <input type="number" id="detail-qty" min="1" value="1" class="pd-qty-input">
                </div>

                <button class="btn pd-add-btn" id="add-config-btn">
                    <i class="fas fa-shopping-cart" style="margin-right:8px;"></i>Kosárba
                </button>
                <p class="pd-note">A személyre szabott mezek gyártása +2-4 munkanap.</p>

                <div class="pd-accordion">
                    <details>
                        <summary>Termékleírás</summary>
                        <p>${product.description} Modern, légáteresztő anyagból készült, meccsre és hétköznapi viseletre is ideális.</p>
                    </details>
                    <details>
                        <summary>Szállítás és visszaküldés</summary>
                        <p>Szállítás 2-4 munkanap. Egyedi feliratozás esetén 4-7 munkanap. Visszaküldés 14 napon belül, sértetlen állapotban.</p>
                    </details>
                    <details>
                        <summary>Mosási útmutató</summary>
                        <p>30 fokon, kifordítva mosható. Fehérítőt ne használj, szárítógépbe ne tedd. A feliratos mezeket alacsony hőfokon vasald.</p>
                    </details>
                </div>
            </div>
        </section>
    `;

    initProductConfigurator(product);
}

function initProductConfigurator(product) {
    const sizeGroup = document.getElementById('size-group');
    const badgeGroup = document.getElementById('badge-group');
    const nameGroup = document.getElementById('name-group');
    const playerWrap = document.getElementById('player-select-wrap');
    const customWrap = document.getElementById('custom-wrap');
    const priceElement = document.getElementById('pd-price');
    const addBtn = document.getElementById('add-config-btn');
    const qtyInput = document.getElementById('detail-qty');

    if (!sizeGroup || !badgeGroup || !nameGroup || !priceElement || !addBtn || !qtyInput) {
        return;
    }

    function getActive(group) {
        return group.querySelector('.chip.active');
    }

    function selectChip(group, button) {
        group.querySelectorAll('.chip').forEach(function(chip) {
            chip.classList.remove('active');
        });
        button.classList.add('active');
    }

    function getExtra(activeChip) {
        return Number(activeChip ? activeChip.dataset.extra : 0) || 0;
    }

    function updateConfiguratorPrice() {
        const sizeActive = getActive(sizeGroup);
        const badgeActive = getActive(badgeGroup);
        const nameActive = getActive(nameGroup);

        const unitPrice = product.price + getExtra(sizeActive) + getExtra(badgeActive) + getExtra(nameActive);
        const qty = Math.max(1, Number(qtyInput.value) || 1);
        const totalPrice = unitPrice * qty;

        priceElement.textContent = totalPrice.toLocaleString() + ' Ft';
    }

    function updatePersonalizationVisibility() {
        const nameActive = getActive(nameGroup);
        const mode = nameActive ? nameActive.dataset.value : 'none';

        if (playerWrap) {
            playerWrap.style.display = mode === 'player' ? 'block' : 'none';
        }

        if (customWrap) {
            customWrap.style.display = mode === 'custom' ? 'grid' : 'none';
        }
    }

    [sizeGroup, badgeGroup, nameGroup].forEach(function(group) {
        group.querySelectorAll('.chip').forEach(function(button) {
            button.addEventListener('click', function() {
                selectChip(group, button);
                updatePersonalizationVisibility();
                updateConfiguratorPrice();
            });
        });
    });

    qtyInput.addEventListener('input', updateConfiguratorPrice);

    addBtn.addEventListener('click', function() {
        const sizeActive = getActive(sizeGroup);
        const badgeActive = getActive(badgeGroup);
        const nameActive = getActive(nameGroup);
        const selectedPlayer = document.getElementById('fake-player-select');
        const customName = document.getElementById('custom-name');
        const customNumber = document.getElementById('custom-number');
        const qty = Math.max(1, Math.floor(Number(qtyInput.value) || 1));

        const size = sizeActive ? sizeActive.dataset.value : 'M';
        const badge = badgeActive ? badgeActive.dataset.value : 'Nincs';
        const nameMode = nameActive ? nameActive.dataset.value : 'none';

        let playerOption = 'Nincs';
        if (nameMode === 'player' && selectedPlayer) {
            playerOption = selectedPlayer.value;
        }

        if (nameMode === 'custom') {
            const cName = customName ? customName.value.trim().toUpperCase() : '';
            const cNum = customNumber ? Number(customNumber.value) : 0;

            if (!cName || !cNum || cNum < 1 || cNum > 99) {
                showToast('Add meg a saját nevet és az 1-99 közötti számot.', 'warning');
                return;
            }

            playerOption = cName + '#' + cNum;
        }

        const unitPrice = product.price + getExtra(sizeActive) + getExtra(badgeActive) + getExtra(nameActive);
        const optionSummary = 'Meret: ' + size + ' | Matrica: ' + badge + ' | Nev/szam: ' + playerOption;
        const configKey = [size, badge, playerOption, unitPrice].join('|');

        addCartItem({
            id: product.id,
            name: product.name,
            price: unitPrice,
            image: product.image,
            category: product.category,
            configKey: configKey,
            optionSummary: optionSummary,
            size: size,
            badgeOption: badge,
            playerOption: playerOption
        }, qty);

        showToast('Konfigurált mez sikeresen a kosárba került.', 'success');
    });

    updatePersonalizationVisibility();
    updateConfiguratorPrice();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const checkoutForm = document.getElementById('checkout-form');

    if (!container || !totalElement) {
        return;
    }

    const cart = getCart();
    let total = 0;

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p>A kosár jelenleg üres.</p>';
        totalElement.textContent = '';

        if (checkoutForm) {
            checkoutForm.style.display = 'none';
        }

        return;
    }

    if (checkoutForm) {
        checkoutForm.style.display = 'block';
    }

    cart.forEach(function(item) {
        total += item.price * item.quantity;

        const imageHtml = item.image
            ? `<img src="${item.image}" alt="${item.name}" style="width:74px;height:74px;object-fit:contain;background:#f8fafc;border-radius:10px;padding:4px;">`
            : '<i class="fas fa-tshirt"></i>';

        container.innerHTML += `
            <div class="cart-item-card">
                <div class="cart-item-image">${imageHtml}</div>
                <div class="product-info">
                    <h3>${item.name}</h3>
                    ${item.optionSummary ? `<p class="cart-option-meta">${item.optionSummary}</p>` : ''}
                    <p>${item.price.toLocaleString()} Ft / db</p>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span class="qty-value">${item.quantity} db</span>
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">Törlés</button>
                    </div>
                </div>
                <div class="cart-line-total">${(item.price * item.quantity).toLocaleString()} Ft</div>
            </div>
        `;
    });

    totalElement.textContent =
        'Összesen: ' + total.toLocaleString() + ' Ft';
}

function changeQuantity(id, diff) {
    const cart = getCart();
    const item = cart.find(function(cartItem) {
        return cartItem.id === id;
    });

    if (!item) {
        return;
    }

    item.quantity += diff;

    if (item.quantity <= 0) {
        const filtered = cart.filter(function(cartItem) {
            return cartItem.id !== id;
        });

        saveCart(filtered);
        renderCart();
        showToast('A terméket eltávolítottuk a kosárból.', 'info');
        return;
    }

    saveCart(cart);
    renderCart();
}

function removeFromCart(id) {
    const cart = getCart();
    const filtered = cart.filter(function(item) {
        return item.id !== id;
    });

    saveCart(filtered);
    renderCart();
    showToast('A termék törölve a kosárból.', 'info');
}

function checkout() {
    const cart = getCart();

    if (cart.length === 0) {
        showToast('A kosár üres.', 'warning');
        return;
    }

    const nameInput = document.getElementById('order-name');
    const emailInput = document.getElementById('order-email');
    const phoneInput = document.getElementById('order-phone');
    const paymentInput = document.getElementById('order-payment');
    const addressInput = document.getElementById('order-address');
    const noteInput = document.getElementById('order-note');

    if (
        !nameInput || !emailInput || !phoneInput ||
        !paymentInput || !addressInput
    ) {
        showToast('A rendelési űrlap nem található ezen az oldalon.', 'warning');
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const payment = paymentInput.value;
    const address = addressInput.value.trim();

    if (!name || !email || !phone || !payment || !address) {
        showToast('Kérlek, tölts ki minden kötelező mezőt.', 'warning');
        return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
        showToast('Hibás email cím formátum.', 'warning');
        return;
    }

    const orderId = 'NJ-' + Date.now().toString().slice(-6);

    localStorage.removeItem('cart');
    updateCartCount();
    renderCart();

    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
    paymentInput.value = '';
    addressInput.value = '';

    if (noteInput) {
        noteInput.value = '';
    }

    showToast('Köszönjük a rendelésed! Azonosító: ' + orderId, 'success');

    const cartPage = document.querySelector('.cart-page');
    if (cartPage) {
        cartPage.innerHTML = `
            <div class="order-success">
                <div class="order-success-icon"><i class="fas fa-check-circle"></i></div>
                <h2>Rendelés leadva!</h2>
                <p>Köszönjük a vásárlásodat! Rendelési azonosítód:</p>
                <div class="order-id">${orderId}</div>
                <p class="order-success-sub">Hamarosan e-mailben visszaigazolást kapsz.</p>
                <a href="index.html" class="btn">
                    <i class="fas fa-home" style="margin-right:8px;"></i>Vissza a főoldalra
                </a>
            </div>
        `;
    }
}

function initFilter() {
    const filter = document.getElementById('teamFilter');

    if (!filter) {
        return;
    }

    const categories = [];
    products.forEach(function(product) {
        if (!categories.includes(product.category)) {
            categories.push(product.category);
        }
    });

    categories.forEach(function(cat) {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filter.appendChild(option);
    });

    filter.addEventListener('change', function() {
        if (filter.value === 'all') {
            renderProducts('products-container', products);
        } else {
            const filtered = products.filter(function(product) {
                return product.category === filter.value;
            });

            renderProducts('products-container', filtered);
        }
    });
}

function initSearch() {
    const input = document.getElementById('searchInput');

    if (!input) {
        return;
    }

    const wrapper = input.parentElement;
    if (wrapper) {
        wrapper.classList.add('search-wrapper');
    }

    let dropdown = wrapper ? wrapper.querySelector('.search-dropdown') : null;
    if (!dropdown && wrapper) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        wrapper.appendChild(dropdown);
    }

    function setListMode(containerId, enabled) {
        const container = document.getElementById(containerId);
        if (container) {
            container.classList.toggle('list-mode', enabled);
        }
    }

    function renderSearchDropdown(matches, searchText) {
        if (!dropdown) {
            return;
        }

        if (searchText === '') {
            dropdown.classList.remove('show');
            dropdown.innerHTML = '';
            return;
        }

        if (matches.length === 0) {
            dropdown.innerHTML = '<div class="search-item-empty">Nincs találat.</div>';
            dropdown.classList.add('show');
            return;
        }

        dropdown.innerHTML = matches.slice(0, 6).map(function(product) {
            return `
                <button type="button" class="search-item" onclick="openProduct(${product.id})">
                    <span class="search-item-name">${product.name}</span>
                    <span class="search-item-meta">${product.category}</span>
                </button>
            `;
        }).join('');

        dropdown.classList.add('show');
    }

    input.addEventListener('input', function() {
        const searchText = input.value.toLowerCase();

        const filtered = products.filter(function(product) {
            return (
                product.name.toLowerCase().includes(searchText) ||
                product.category.toLowerCase().includes(searchText)
            );
        });

        renderSearchDropdown(filtered, searchText);

        const useListMode = searchText !== '';

        if (document.getElementById('products-container')) {
            renderProducts('products-container', filtered);
            setListMode('products-container', useListMode);
        }

        if (document.getElementById('featured-products')) {
            renderProducts('featured-products', filtered);
            // A főoldali "Legfelkapottabb mezek" kinézete kereséskor se váltson listanézetre.
            setListMode('featured-products', false);
        }
    });

    document.addEventListener('click', function(event) {
        if (wrapper && dropdown && !wrapper.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
}

function ensureChatbotMarkup() {
    if (document.getElementById('chat-window')) {
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'chatbot';
    wrapper.innerHTML = `
        <button id="chat-toggle"><i class="fas fa-comments"></i></button>
        <div class="chat-window" id="chat-window">
            <div class="chat-header">NeumannShop Chatbot</div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input">
                <input type="text" id="chat-input" placeholder="Írj egy kérdést...">
                <button onclick="sendMessage()">Küldés</button>
            </div>
        </div>
    `;

    document.body.appendChild(wrapper);
}

function appendChatMessage(role, text) {
    const messages = document.getElementById('chat-messages');
    if (!messages) {
        return;
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + (role === 'user' ? 'chat-user' : 'chat-bot');
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
}

function getChatbotReply(question) {
    const q = question.toLowerCase();

    if (q.includes('hello') || q.includes('szia') || q.includes('jó napot')) {
        return 'Szia! Szívesen segítek. Kérdezhetsz szállításról, méretről, fizetésről vagy rendelésről.';
    }

    if (q.includes('szállítás') || q.includes('mikor jon') || q.includes('mikor jön') || q.includes('mikor érkezik')) {
        return 'A szállítás általában 2-4 munkanap, személyre szabott mez esetén 4-7 munkanap.';
    }

    if (q.includes('szállítási díj') || q.includes('szallitasi dij') || q.includes('futár') || q.includes('futar')) {
        return 'A pontos szállítási díj a rendelési folyamatban látható, a címtől és a fizetési módtól függően.';
    }

    if (q.includes('méret') || q.includes('meret') || q.includes('mekkora') || q.includes('xs') || q.includes('xl')) {
        return 'A termékoldalon XS-XL méretek közül választhatsz. XL méretnél felár jelenhet meg a konfigurációban.';
    }

    if (q.includes('játékos') || q.includes('jatekos') || q.includes('név') || q.includes('nev') || q.includes('szám') || q.includes('szam') || q.includes('felirat')) {
        return 'A termékoldalon választhatsz játékos opciót vagy saját név/szám feliratot is.';
    }

    if (q.includes('felár') || q.includes('felar') || q.includes('plusz') || q.includes('többe kerül') || q.includes('tobbe kerul')) {
        return 'A felárak opciófüggők: például XL méret, matrica és név/szám választás plusz költséget adhat hozzá.';
    }

    if (q.includes('ár') || q.includes('ar') || q.includes('mennyibe') || q.includes('mennyi')) {
        return 'Az árak minden termékkártyán látszanak, az extra opciók pedig automatikusan hozzáadódnak a végösszeghez.';
    }

    if (q.includes('akció') || q.includes('akcio') || q.includes('kedvezmény') || q.includes('kupon')) {
        return 'Az aktuális akciók időszakosan változnak. A termékeknél vagy a kosárban láthatod, ha elérhető kedvezmény.';
    }

    if (q.includes('fizetés') || q.includes('fizetes') || q.includes('bankkártya') || q.includes('bankkartya') || q.includes('utánvét') || q.includes('utanvet') || q.includes('átutalás') || q.includes('atutalas')) {
        return 'Elérhető fizetési módok: bankkártya, átutalás és utánvét. Ezeket a kosár oldalon választhatod.';
    }

    if (q.includes('vissza') || q.includes('visszaküld') || q.includes('visszakuld') || q.includes('csere') || q.includes('garancia')) {
        return 'Visszaküldés 14 napon belül lehetséges sértetlen állapotban. Egyedi feliratozásnál csere korlátozott lehet.';
    }

    if (q.includes('kapcsolat') || q.includes('telefon') || q.includes('email') || q.includes('e-mail')) {
        return 'Kapcsolat: +36 36 536 070, info@neumannshop.hu';
    }

    if (q.includes('cím') || q.includes('cim') || q.includes('hol vagytok')) {
        return 'Címünk: Eger, Rákóczi út 48, 3300';
    }

    if (q.includes('nyitvatartás') || q.includes('nyitvatartas') || q.includes('nyitva')) {
        return 'Nyitvatartás: Hétfőtől péntekig 08:00-18:00.';
    }

    if (q.includes('kosár') || q.includes('kosar') || q.includes('darab') || q.includes('mennyiség') || q.includes('mennyiseg')) {
        return 'A kosár oldalon tudod módosítani a darabszámot (+/-), törölni terméket és látni a végösszeget.';
    }

    if (q.includes('rendelés') || q.includes('rendeles') || q.includes('hogyan rendelek') || q.includes('megrendelés')) {
        return 'Rendelés menete: termék kiválasztása -> kosár -> adatok megadása -> fizetési mód választása -> rendelés leadása.';
    }

    if (q.includes('tabella') || q.includes('szezon') || q.includes('meccs')) {
        return 'A főoldalon található szezon tabella mintaadatokat jelenít meg, látvány- és demó célra.';
    }

    return 'Ebben is segítek. Kérdezhetsz például szállításról, méretről, feliratozásról, fizetésről, visszaküldésről vagy rendelésről.';
}

function initChatbot() {
    ensureChatbotMarkup();

    const toggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    if (toggle && chatWindow) {
        // Alapból nyitva legyen az oldal betöltésekor
        chatWindow.style.display = 'block';

        toggle.addEventListener('click', function() {
            const isOpen = chatWindow.style.display === 'block';
            chatWindow.style.display = isOpen ? 'none' : 'block';

            if (!isOpen && input) {
                input.focus();
            }
        });
    }

    if (input) {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    if (messages && !messages.dataset.initialized) {
        appendChatMessage('bot', 'Szia! A NeumannShop asszisztense vagyok. Miben segíthetek?');
        messages.dataset.initialized = '1';
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');

    if (!input) {
        return;
    }

    const question = (input.value || '').trim();
    if (question === '') {
        return;
    }

    appendChatMessage('user', question);

    const reply = getChatbotReply(question);
    appendChatMessage('bot', reply);

    input.value = '';
}

function initSeasonTableAnimation() {
    const tableSection = document.querySelector('.season-table');
    if (!tableSection) {
        return;
    }

    const rows = tableSection.querySelectorAll('.standings-table tbody tr');
    if (!rows.length) {
        return;
    }

    rows.forEach(function(row, index) {
        row.classList.add('season-row-animate');
        row.style.transitionDelay = (index * 90) + 'ms';
    });

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                rows.forEach(function(row) {
                    row.classList.add('is-visible');
                });

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    observer.observe(tableSection);
}

function initNextMatchAnimation() {
    const nextMatchCard = document.getElementById('next-match-card');
    if (!nextMatchCard) {
        return;
    }

    nextMatchCard.classList.add('reveal-ready');

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                nextMatchCard.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.35
    });

    observer.observe(nextMatchCard);
}

// Oldal inicializálása
renderProducts('featured-products', products);
renderProducts('products-container', products);
renderProductDetail();
renderCart();
updateCartCount();
initFilter();
initSearch();
initChatbot();
initSeasonTableAnimation();
initNextMatchAnimation();
