const axios = require('axios');

const subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;
const endpoint = process.env.AZURE_ENDPOINT;
const apiVersion = '2024-02-29-preview';

const analyzeInvoice = async (urlSource) => {
    try {
        const postUrl = `${endpoint}/documentintelligence/documentModels/prebuilt-invoice:analyze?api-version=${apiVersion}`;

        const postResponse = await axios.post(
            postUrl,
            { urlSource },
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                    'Content-Type': 'application/json',
                },
            }
        );

        return postResponse.headers['apim-request-id'];
    } catch (error) {
        throw new Error(`Error in POST request: ${error.message}`);
    }
};

// Polling function using async/await
const pollInvoiceResults = async (requestId, maxRetries = 10, delay = 3000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const getUrl = `${endpoint}/documentintelligence/documentModels/prebuilt-invoice/analyzeResults/${requestId}?api-version=${apiVersion}`;

            const response = await axios.get(getUrl, {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                },
            });

            // If analysis succeeded, return the results
            if (response.data.status === 'succeeded') {
                return response.data;
            }

            // If analysis failed, throw an error
            if (response.data.status === 'failed') {
                throw new Error('Analysis failed');
            }

            // Wait for a delay before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (error) {
            if (attempt === maxRetries - 1) {
                throw new Error(`Exceeded maximum retries. Last error: ${error.message}`);
            }
        }
    }
    throw new Error('Analysis did not complete within the allotted time');
};

// Controller function to handle the complete flow
const handleInvoiceAnalysis = async (req, res) => {
    const { urlSource } = req.body;

    try {
        // Step 1: POST the document and get the request ID
        const requestId = await analyzeInvoice(urlSource);
        console.log(`Request ID: ${requestId}`);

        // Step 2: Poll until the analysis is complete
        const analysisResults = await pollInvoiceResults(requestId);
        res.json(analysisResults);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    handleInvoiceAnalysis,
};


