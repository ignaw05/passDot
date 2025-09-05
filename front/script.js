// Importar funciones de encriptación personalizadas
import { encryptMessage as customEncrypt, decryptMessage as customDecrypt } from './crypto-utils.js';

const btnAdd = document.getElementById("btnAdd");
const btnMetamask = document.getElementById("btnMetamask");
const btnDisconnect = document.getElementById("btnDisconnect");
const inpWebsite = document.getElementById("inpWebsite");
const inpUser = document.getElementById("inpUser");
const inpPassword = document.getElementById("inpPassword");
const inpSearch = document.getElementById("inpSearch");
const passList = document.getElementById("passList");
const addressPara = document.getElementById("addressPara");

let userAccount;
let pubKey;
let allPasswordRows = []; // Array para mantener todas las filas de contraseñas

const connectWallet = async () => {
    try {
        const accounts = await ethereum.request({
            method: 'eth_requestAccounts'    // Use the eth_requestAccounts method to prompt the user to select and connect an account.
        });
        if (accounts.length === 0) {
            alert('No accounts found');
            return;
        }
        userAccount = accounts[0];
        addressPara.textContent = `${userAccount}`;
        addressPara.style.color = 'green';
        btnMetamask.style.display = 'none';
        console.log(userAccount);

        pubKey = await window.ethereum.request({
            method: 'eth_getEncryptionPublicKey',
            params: [userAccount]
         });
         console.log(pubKey)
    } catch (err) {
        alert(err);
    }
}

// Funciones de encriptación simplificadas usando crypto-utils.js
const encryptMessage = async (message) => {
  try {
    return customEncrypt(message, pubKey);
  } catch (err) {
    console.error('Encryption failed:', err);
    alert('Encryption failed: ' + err.message);
    return null;
  }
};

const decryptMessage = async (encryptedData) => {
  try {
    return customDecrypt(encryptedData, pubKey);
  } catch (err) {
    console.error('Decryption failed:', err);
    alert('Decryption failed: ' + err.message);
    return null;
  }
};

btnMetamask.addEventListener("click", connectWallet); 

btnAdd.addEventListener('click', async () => {
    let message = inpWebsite.value+"|"+inpUser.value+"|"+inpPassword.value+"|";

    const encrypted = await encryptMessage(message);    
    const decrypted = await decryptMessage(encrypted);

    if (decrypted) {
        const content = decrypted.split("|");
        console.log(content);
        const decMessage = document.createElement("tr");
        decMessage.setAttribute('id',content[0])
        decMessage.innerHTML = `<td>${content[0]}</td><td>${content[1]}</td><td>${content[2]}</td>` ;
        passList.appendChild(decMessage);
        
        // Agregar la nueva fila al array de todas las filas
        allPasswordRows.push(decMessage.cloneNode(true));
    } else {
        alert("Decryption failed. Cannot display message.");
    }
})

inpSearch.addEventListener("input", () => {
    try {
        let searchTerm = inpSearch.value.toLowerCase().trim();
        
        // Guardar las cabeceras antes de limpiar
        const headers = Array.from(passList.querySelectorAll('th'));
        
        // Limpiar la lista pero preservar la estructura
        passList.innerHTML = "";
        
        // Restaurar las cabeceras
        headers.forEach(header => passList.appendChild(header));
        
        if (searchTerm === "") {
            // Si no hay término de búsqueda, mostrar todas las filas del array
            allPasswordRows.forEach(row => {
                const clonedRow = row.cloneNode(true);
                passList.appendChild(clonedRow);
            });
        } else {
            // Filtrar filas del array que coincidan con el término de búsqueda
            const filteredRows = allPasswordRows.filter(row => {
                const websiteTd = row.querySelector('td:first-child');
                if (websiteTd) {
                    return websiteTd.textContent.toLowerCase().includes(searchTerm);
                }
                return false;
            });
            
            // Mostrar las filas filtradas (clonadas)
            filteredRows.forEach(row => {
                const clonedRow = row.cloneNode(true);
                passList.appendChild(clonedRow);
            });
        }
    } catch (err) {
        console.error("Error en búsqueda:", err);
    }
})