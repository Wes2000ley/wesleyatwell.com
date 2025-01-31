// server.js

const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const NodeCache = require('node-cache'); // Moved to the top for better visibility

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// AWS Configuration
AWS.config.update({
    region: process.env.AWS_REGION || 'us-west-1', // Ensure your DynamoDB table is in this region
    // No need to set accessKeyId and secretAccessKey when using IAM roles
});

// Initialize DynamoDB Document Client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'Pokemon'; // Ensure this matches your DynamoDB table name

// Initialize NodeCache
const cache = new NodeCache({ stdTTL: 3600 }); // Cache expires in 1 hour

// Define Routes
const router = express.Router();

/**
 * GET /api/pokemons
 * Retrieve all Pokémon
 * Note: DynamoDB Query operation to fetch all items with Category = 'Pokemon'
 * Implements pagination using LastEvaluatedKey
 */
router.get('/pokemons', async (req, res) => {
    const { lastEvaluatedKey } = req.query;
    const cacheKey = `pokemons_${lastEvaluatedKey || 'first_page'}`;

    // Attempt to retrieve cached response
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
        console.log('Serving /pokemons from cache.');
        return res.json(cachedResponse);
    }

    // Construct the base parameters for the query
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#cat = :categoryValue',
        ExpressionAttributeNames: {
            '#cat': 'Category' // Attribute name for Partition Key
        },
        ExpressionAttributeValues: {
            ':categoryValue': 'Pokemon' // Value for Partition Key
        }
    };

    // If lastEvaluatedKey is provided, decode it and set as ExclusiveStartKey
    if (lastEvaluatedKey) {
        try {
            // DynamoDB expects ExclusiveStartKey as a JSON object
            params.ExclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString('utf-8'));
        } catch (error) {
            console.error('Error parsing lastEvaluatedKey:', error);
            return res.status(400).json({ message: 'Invalid lastEvaluatedKey format' });
        }
    }

    try {
        const data = await dynamoDB.query(params).promise();

        // Encode the LastEvaluatedKey to send back to the client
        const response = {
            items: data.Items,
            lastEvaluatedKey: data.LastEvaluatedKey ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64') : null
        };

        // Store the response in the cache
        cache.set(cacheKey, response);
        console.log(`Caching response for key: ${cacheKey}`);

        res.json(response);
    } catch (error) {
        console.error('Error querying DynamoDB:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * GET /api/pokemons/:id
 * Retrieve a specific Pokémon by ID
 * Utilizes the primary key (Category and ID) for efficient retrieval
 */
router.get('/pokemons/:id', async (req, res) => {
    const { id } = req.params;

    // Validate that ID is a number
    const pokemonID = parseInt(id, 10);
    if (isNaN(pokemonID)) {
        return res.status(400).json({ message: 'Invalid Pokémon ID. ID must be a number.' });
    }

    const params = {
        TableName: TABLE_NAME,
        Key: {
            'Category': 'Pokemon', // Partition Key
            'ID': pokemonID        // Sort Key
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            return res.status(404).json({ message: 'Pokémon not found' });
        }
        res.json(data.Item);
    } catch (error) {
        console.error(`Error fetching Pokémon with ID "${id}":`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Mount the router at /api
app.use('/api', router);

// Handle Undefined Routes
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint Not Found' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
