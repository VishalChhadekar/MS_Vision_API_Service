const axios = require('axios');

const subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;
const endpoint = process.env.AZURE_ENDPOINT;
const apiVersion = '2024-02-29-preview';

// The rest of your code...


// POST request to submit the document for analysis
const analyzeInvoice = async (urlSource) => {
    try {
        const postUrl = `${endpoint}/documentintelligence/documentModels/prebuilt-invoice:analyze?api-version=${apiVersion}`;

        const postResponse = await axios.post(
            postUrl,
            { urlSource },
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        const requestId = postResponse.headers['apim-request-id'];
        return requestId;
    } catch (error) {
        throw new Error(`Error in POST request: ${error.message}`);
    }
};

// GET request to retrieve the analysis results using the request ID
const getInvoiceResults = async (requestId) => {
    try {
        const getUrl = `${endpoint}/documentintelligence/documentModels/prebuilt-invoice/analyzeResults/${requestId}?api-version=${apiVersion}`;

        const getResponse = await axios.get(getUrl, {
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        });

        return getResponse.data;
    } catch (error) {
        throw new Error(`Error in GET request: ${error.message}`);
    }
};

// Controller function to handle the complete flow
const handleInvoiceAnalysis = async (req, res) => {
    const { urlSource } = req.body;

    try {
        // Step 1: POST the document and get the request ID
        const requestId = await analyzeInvoice(urlSource);
        console.log(`Request ID: ${requestId}`);

        // Step 2: Wait a few seconds for processing and retrieve the results using the request ID
        setTimeout(async () => {
            try {
                const analysisResults = await getInvoiceResults(requestId);
                res.json(analysisResults);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        }, 2000); // Adjust delay as needed for processing time

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    handleInvoiceAnalysis
};
