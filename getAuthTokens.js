(function () {
    function generateTokens(url) {
        // Extract the query parameters from the URL
        const urlParams = new URL(url).searchParams;
        const result = {};

        // Loop through the parameters and match each "acct" with the corresponding "token"
        for (const [key, value] of urlParams.entries()) {
            if (key.startsWith('acct')) {
                const tokenKey = `token${key.split('').pop()}`;
                const tokenValue = urlParams.get(tokenKey);

                if (tokenValue) {
                    result[value] = tokenValue;
                }
            }
        }

        return result;
    }

    function storeTokensInLocalStorage() {
        localStorage.removeItem("client_accounts");
        console.log("removed existing tokens");
        localStorage.setItem("client_accounts", JSON.stringify(generateTokens(window.location.href)));
    }

    const path = window.location.pathname.split("/").pop();
    if (path === 'redirect') {
        storeTokensInLocalStorage();
    }
})()

function getTokensFromLocalStorage() {
    const tokens = localStorage.getItem("client_accounts");
    if (tokens) {
        return JSON.parse(tokens);
    }
    return null;
}

// ?acct1=account_1&token1=token_1&acct2=account_2&token2=token_2&acct3=account_3&token3=token_3