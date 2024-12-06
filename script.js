document.addEventListener('DOMContentLoaded', function() {
    const ajouterButton = document.getElementById('Ajouter');
    const modal = document.getElementById('myModal');
    const closeModalButtons = document.querySelectorAll('.close');
    const extensionSelect = document.getElementById('extension');
    const numeroInput = document.getElementById('numero');
    const popupAjouterButton = document.getElementById('popupAjouter');
    const cardPreview = document.getElementById('cardPreview');
    const cardDetails = document.getElementById('cardDetails');
    const tableauCarte = document.getElementById('TableauCarte').querySelector('tbody');
    const afficherButton = document.getElementById('Afficher');
    const cardModal = document.getElementById('cardModal');
    const cardImage = document.getElementById('cardImage');

    let currentCard = null;
    let selectedCardRow = null;

    // Fonction pour ouvrir le pop-up
    function openModal() {
        modal.style.display = 'block';
        fetchExtensions();
    }

    // Fonction pour fermer le pop-up
    function closeModalFunc() {
        modal.style.display = 'none';
        cardPreview.style.display = 'none';
        numeroInput.value = '';
        currentCard = null;
    }

    // Fonction pour récupérer les extensions depuis l'API Scryfall
    async function fetchExtensions() {
        try {
            const response = await fetch('https://api.scryfall.com/sets');
            const data = await response.json();
            const sortedSets = data.data.sort((a, b) => a.name.localeCompare(b.name));
            extensionSelect.innerHTML = '<option value="" disabled selected>Choisissez une extension</option>';
            sortedSets.forEach(set => {
                const option = document.createElement('option');
                option.value = set.code;
                option.textContent = set.name;
                extensionSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des extensions:', error);
        }
    }

    // Fonction pour récupérer les informations de la carte depuis l'API Scryfall
    async function fetchCardDetails() {
        const extension = extensionSelect.value;
        const numero = numeroInput.value;
        if (extension && numero) {
            try {
                const response = await fetch(`https://api.scryfall.com/cards/${extension}/${numero}`);
                const data = await response.json();
                currentCard = data;
                displayCardDetails(data);
            } catch (error) {
                console.error('Erreur lors de la récupération des informations de la carte:', error);
            }
        }
    }

    // Fonction pour afficher les informations de la carte dans le pop-up
    function displayCardDetails(card) {
        cardDetails.innerHTML = `
            <h2>${card.name}</h2>
            <p><strong>Extension:</strong> ${card.set_name}</p>
            <p><strong>Couleur:</strong> ${card.colors ? card.colors.join(', ') : 'N/A'}</p>
            <p><strong>Coût:</strong> ${card.mana_cost ? card.mana_cost : 'N/A'}</p>
            <p><strong>Type:</strong> ${card.type_line}</p>
            <p><strong>Atq:</strong> ${card.power ? card.power : 'N/A'}</p>
            <p><strong>Def:</strong> ${card.toughness ? card.toughness : 'N/A'}</p>
            <p><strong>Compétences:</strong> ${card.oracle_text ? card.oracle_text.replace(/\n/g, '<br>') : 'N/A'}</p>
            <p><strong>Texte:</strong> ${card.flavor_text ? card.flavor_text.replace(/\n/g, '<br>') : 'N/A'}</p>
            <p><strong>Rareté:</strong> ${card.rarity}</p>
        `;
        cardPreview.style.display = 'block';
    }

    // Fonction pour ajouter les informations de la carte dans le tableau
    function addCardToTable() {
        if (currentCard) {
            const row = document.createElement('tr');
            const cardImageUrl = currentCard.image_uris ? currentCard.image_uris.normal : '';
            row.innerHTML = `
                <td>${currentCard.collector_number}</td>
                <td>${currentCard.set_name}</td>
                <td>${currentCard.colors ? currentCard.colors.join(', ') : 'N/A'}</td>
                <td>${currentCard.mana_cost ? currentCard.mana_cost : 'N/A'}</td>
                <td>${currentCard.name}</td>
                <td>${currentCard.type_line}</td>
                <td>${currentCard.power ? currentCard.power : 'N/A'}</td>
                <td>${currentCard.toughness ? currentCard.toughness : 'N/A'}</td>
                <td>${currentCard.oracle_text ? currentCard.oracle_text.replace(/\n/g, '<br>') : 'N/A'}</td>
                <td>${currentCard.flavor_text ? currentCard.flavor_text.replace(/\n/g, '<br>') : 'N/A'}</td>
                <td>${currentCard.rarity}</td>
                <td>
                    <button class="decrease-button">-</button>
                    <span class="quantity">1</span>
                    <button class="increase-button">+</button>
                </td>
                <td>
                    <input type="radio" name="cardSelection" class="card-selection" data-image-url="${cardImageUrl}">
                    <button class="remove-button"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tableauCarte.appendChild(row);
            closeModalFunc();
        }
    }

    // Fonction pour ouvrir le modal de l'image de la carte
    function openCardModal() {
        if (selectedCardRow) {
            const cardImageUrl = selectedCardRow.querySelector('.card-selection').dataset.imageUrl;
            cardImage.src = cardImageUrl;
            cardModal.style.display = 'block';
        }
    }

    // Fonction pour fermer le modal de l'image de la carte
    function closeCardModal() {
        cardModal.style.display = 'none';
    }

    // Événements
    ajouterButton.addEventListener('click', openModal);
    closeModalButtons.forEach(button => button.addEventListener('click', closeModalFunc));
    extensionSelect.addEventListener('change', fetchCardDetails);
    numeroInput.addEventListener('input', fetchCardDetails);
    popupAjouterButton.addEventListener('click', addCardToTable);
    afficherButton.addEventListener('click', openCardModal);

    // Fermer le pop-up si l'utilisateur clique en dehors de celui-ci
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModalFunc();
        }
        if (event.target == cardModal) {
            closeCardModal();
        }
    });

    // Fermer le modal de l'image de la carte si l'utilisateur clique sur la croix
    closeModalButtons.forEach(button => button.addEventListener('click', function() {
        if (button.closest('#cardModal') !== null) {
            closeCardModal();
        }
    }));

    // Supprimer une carte du tableau
    tableauCarte.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-button') || event.target.parentElement.classList.contains('remove-button')) {
            const row = event.target.closest('tr');
            row.remove();
        }
    });

    // Augmenter ou diminuer la quantité de cartes
    tableauCarte.addEventListener('click', function(event) {
        if (event.target.classList.contains('increase-button')) {
            const quantitySpan = event.target.parentElement.querySelector('.quantity');
            let quantity = parseInt(quantitySpan.textContent);
            quantitySpan.textContent = quantity + 1;
        } else if (event.target.classList.contains('decrease-button')) {
            const quantitySpan = event.target.parentElement.querySelector('.quantity');
            let quantity = parseInt(quantitySpan.textContent);
            if (quantity > 1) {
                quantitySpan.textContent = quantity - 1;
            }
        }
    });

    // Sélectionner une carte dans le tableau
    tableauCarte.addEventListener('change', function(event) {
        if (event.target.classList.contains('card-selection')) {
            selectedCardRow = event.target.closest('tr');
        }
    });
});
