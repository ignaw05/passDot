const btnAdd = document.getElementById("btnAdd");
const btnMetamask = document.getElementById("btnMetamask");
const btnDisconnect = document.getElementById("btnDisconnect");
const inpWebsite = document.getElementById("inpWebsite");
const inpUser = document.getElementById("inpUser");
const inpPassword = document.getElementById("inpPassword");
const inpSearch = document.getElementById("inpSearch");
const passList = document.getElementById("passList");
const addressPara = document.getElementById("addressPara");

btnMetamask.addEventListener("click", async () => {
    try {
        const accounts = await ethereum.request({
            method: 'eth_requestAccounts'    // Use the eth_requestAccounts method to prompt the user to select and connect an account.
        });
        if (accounts.length === 0) {
            alert('No accounts found');
            return;
        }
        const userAccount = accounts[0];
        addressPara.textContent = `${userAccount}`;
        addressPara.style.color = 'green';
        btnDisconnect.style.display = 'inline';
        btnMetamask.style.display = 'none';
        console.log(userAccount);
    } catch (err) {
        alert(err);
    }
})




