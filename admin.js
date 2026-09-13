import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Fonction pour compresser les images chargées depuis la galerie (Fichier)
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir en base64 compressé (JPEG)
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// Attach to window just in case
window.compressImage = compressImage;

// 2. DOM Elements
const form = document.getElementById('add-product-form');
const titleInput = document.getElementById('prod-title');
const categorySelect = document.getElementById('prod-category');
const priceInput = document.getElementById('prod-price');
const fileInput = document.getElementById('prod-image-file');
const urlInput = document.getElementById('prod-image-url');
const descInput = document.getElementById('prod-desc');
const productsTable = document.getElementById('admin-products-table');
const totalBadge = document.getElementById('total-admin-products');
const btnSubmit = document.getElementById('btn-submit-form');

// 3. Charger et afficher la liste des produits
async function loadAdminProducts() {
    if (!productsTable) return;
    productsTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>`;

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        productsTable.innerHTML = "";
        let count = 0;

        querySnapshot.forEach((docSnap) => {
            count++;
            const p = docSnap.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.image}" alt="${p.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;"></td>
                <td><strong>${p.title}</strong></td>
                <td><span class="badge">${p.category}</span></td>
                <td>${p.price}</td>
                <td>
                    <button class="btn-delete" data-id="${docSnap.id}">
                        <i class="fa-solid fa-trash"></i> Supprimer
                    </button>
                </td>
            `;
            productsTable.appendChild(tr);
        });

        if (totalBadge) totalBadge.textContent = `${count} Produit(s)`;

        // Événement de suppression
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
                    await deleteDoc(doc(db, "products", id));
                    loadAdminProducts();
                }
            });
        });

    } catch (err) {
        console.error("Erreur de chargement:", err);
        productsTable.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Erreur de chargement</td></tr>`;
    }
}

// 4. Soumission du formulaire (Ajout Produit)
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const category = categorySelect.value;
        const price = priceInput.value.trim();
        const desc = descInput.value.trim();
        const file = fileInput.files[0];
        const url = urlInput.value.trim();

        let imageUrl = "";

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Enregistrement...`;

        try {
            // Traitement de l'image (Fichier compressé OU Lien URL)
            if (file) {
                imageUrl = await compressImage(file);
            } else if (url) {
                imageUrl = url;
            } else {
                alert("Veuillez choisir une image ou entrer une URL d'image !");
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `<i class="fa-solid fa-check"></i> Enregistrer le produit`;
                return;
            }

            // Enregistrement dans Firestore
            await addDoc(collection(db, "products"), {
                title: title,
                category: category,
                price: price,
                image: imageUrl,
                description: desc,
                createdAt: serverTimestamp()
            });

            alert("Produit ajouté avec succès !");
            form.reset();
            loadAdminProducts();

        } catch (error) {
            console.error("Erreur Firestore:", error);
            alert("Erreur d'enregistrement sur Firebase : " + error.message);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="fa-solid fa-check"></i> Enregistrer le produit`;
        }
    });
}

// Charger la liste au démarrage
document.addEventListener('DOMContentLoaded', loadAdminProducts);