(function () {
    function getParams(url) {
        // Parse the URL parameters
        let params = new URLSearchParams(url.split('?')[1]);
        let accounts = [];
        let i = 1;

        // Loop to capture dynamic `acct`, `token`, and `cur` parameters
        while (params.has(`acct${i}`) && params.has(`token${i}`) && params.has(`cur${i}`)) {
            // Push each account's details as an object into the accounts array
            accounts.push({
                acct: params.get(`acct${i}`),
                token: params.get(`token${i}`),
                cur: params.get(`cur${i}`)
            });
            i++;
        }

        return accounts;
    }

    const path = window.location.pathname.split("/");
    if (path.includes("redirect")) {
        // Use the function on the current URL
        let url = window.location.href;
        let userAccounts = getParams(url);

        // Store the array of account objects as a JSON string in local storage
        localStorage.setItem('user_accounts', JSON.stringify(userAccounts));

        // Set the first account as the selected account if the list is not empty
        if (userAccounts.length > 0) {
            localStorage.setItem('selected_account', JSON.stringify(userAccounts[0]));
        }
    }
})()