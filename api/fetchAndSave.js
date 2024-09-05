const fs = require('fs');
const path = require('path');

const apiUrl = () => {
    const date=new Date();
    const formattedDate = date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo'
    }).split('/').join('-');
  
    const baseUrl = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';
    const endpoint = 'CotacaoDolarDia(dataCotacao=@dataCotacao)';
    const queryParams = new URLSearchParams({
        '@dataCotacao': `'${formattedDate}'`,
        '$top': '1',
        '$format': 'json',
        '$select': 'cotacaoCompra,cotacaoVenda,dataHoraCotacao'
    });
  
    return `${baseUrl}/${endpoint}?${queryParams}`;
}


async function fetchAndSaveAPIResponse(url, successFile, failureFile) {
    try {
        const response = await fetch(url);

        if (response.ok) {
            // Parse JSON and write the successful response to the success file
            const data = await response.json();
            fs.writeFileSync(successFile, JSON.stringify(data, null, 2));
            console.log(`Saved successful response from ${url} to ${successFile}`);
        } else {
            // Write the error response to the failure file
            fs.writeFileSync(failureFile, JSON.stringify({ error: `Unexpected status: ${response.status}` }, null, 2));
            console.error(`Saved error response from ${url} to ${failureFile}`);
        }
    } catch (error) {
        // Write the error message to the failure file
        fs.writeFileSync(failureFile, JSON.stringify({ error: error.message }, null, 2));
        console.error(`Failed to fetch ${url}:`, error.message);
    }
}

async function runFetchAndSave() {
    
    await fetchAndSaveAPIResponse(
        apiUrl(),
        path.resolve(__dirname, 'success.json'),
        path.resolve(__dirname, 'failure.json'),
    );
    
    // const apis = [
    //     {
    //         url: 'https://api1.example.com',
    //         successFile: path.resolve(__dirname, 'api1-success.json'),
    //         failureFile: path.resolve(__dirname, 'api1-failure.json'),
    //     },
    //     {
    //         url: 'https://api2.example.com',
    //         successFile: path.resolve(__dirname, 'api2-success.json'),
    //         failureFile: path.resolve(__dirname, 'api2-failure.json'),
    //     }
    // ];

    // for (const api of apis) {
    //     await fetchAndSaveAPIResponse(api.url, api.successFile, api.failureFile);
    // }
}

runFetchAndSave().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
