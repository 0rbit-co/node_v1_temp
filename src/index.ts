import { PORT, validateEnvironmentVariables, WALLET_FILE } from './constants/vars';
// import cron from 'node-cron';


import express, { Request, Response } from 'express';
import { readGetRequests, readPostRequests } from './service/ao.service';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { createDataItemSigner, message } from '@permaweb/aoconnect';

// Create an Express application
const app = express();
const port = 3000;

// Define a route handler for the root path
app.get('/', (req: Request, res: Response) => {
    res.send('Orbit Node running');
});

if (validateEnvironmentVariables()) {
    app.listen(port, () => {
        console.info(`Server is running on http://localhost:${PORT}`);
    });
    // cron.schedule('* * * * * *', async () => {
    //     try {
    //         console.info("Cron job triggered");
    //         const requests = await readGetRequests();
    //         console.info("Cron job completed", requests);
    //     } catch (error) {
    //         console.error('An error occurred in the cron job:', error)
    //     }
    // })
    async function getCron() {
        while (true) {
            console.info("Cron job triggered GET");
            try {
                await processRequests();
            } catch (error) {
                console.error("Error occurred in the cron loop:", error);
            }
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay before the next iteration
            console.info("Cron job completed GET");
        }
    }
    async function postCron() {
        while (true) {
            console.info("Cron job triggered POST");
            try {
                await processRequestsPost();
            } catch (error) {
                console.error("Error occurred in the cron loop:", error);
            }
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay before the next iteration
            console.info("Cron job completed POST");
        }
    }

    async function processRequestsPost() {
        const messageData = await readPostRequests();
        const requests = JSON.parse(messageData);
        console.log(requests)
        if (Object.keys(requests).length === 0) throw "No more requests to process.";

        const reqKey = Object.keys(requests)[0];
        const req = requests[reqKey];

        const commonTags = [
            { name: "Request-Type", value: "POST" },
            { name: "Action", value: "Receive-Response" },
            { name: "Request-Msg-Id", value: reqKey },
            { name: "Fee", value: "500000000000" }
        ];

        try {
            console.log("URL:", req.Url)
            const body = JSON.parse(req.Body)
            let res: AxiosResponse;
            if (body) res = await axios.post(req.Url, body);
            else res = await axios.post(req.Url);
            await processResponse(req, res, commonTags);
        } catch (error) {
            await handleError(req, error, commonTags);
        }
    }

    async function processRequests() {
        const messageData = await readGetRequests();
        const requests = JSON.parse(messageData);
        console.log(requests)
        if (Object.keys(requests).length === 0) throw "No more requests to process.";

        const reqKey = Object.keys(requests)[0];
        const req = requests[reqKey];

        const commonTags = [
            { name: "Request-Type", value: "GET" },
            { name: "Action", value: "Receive-Response" },
            { name: "Request-Msg-Id", value: reqKey },
            { name: "Fee", value: "500000000000" }
        ];

        try {
            console.log("URL:", req.Url)
            const res = await axios.get(req.Url);
            await processResponse(req, res, commonTags);
        } catch (error) {
            await handleError(req, error, commonTags);
        }
    }

    async function processResponse(req, res, commonTags) {
        const headerTags = Object.entries(res.headers).map(([key, value]) => ({
            name: key.toString(),
            value: value.toString() // Ensure the value is a string, necessary .if the header values are not just strings
        }));

        const tags = [
            ...commonTags,
            ...headerTags
        ];

        console.log(await message({
            process: req.Target,
            signer: createDataItemSigner(WALLET_FILE),
            data: JSON.stringify(res.data),
            tags: tags
        }));
    }

    async function handleError(req, error, commonTags) {
        console.error("Error while processing request:", error);
        let errorMessage = error.message || "An unknown error occurred";
        let errorData = error.response ? JSON.stringify(error.response.data) : errorMessage;

        const tags = [
            ...commonTags,
            { name: "Status", value: "FAILED" },
            { name: "Content-Type", value: 'application/json' },
            { name: "Msg", value: errorMessage }
        ];

        if (error.response) {
            tags.push({ name: "Code", value: `${error.response.status}` });
        }

        console.log(await message({
            process: req.Target,
            signer: createDataItemSigner(WALLET_FILE),
            tags: tags,
            data: JSON.stringify(errorData)
        }))
    }


    getCron()
    postCron()
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Perform any necessary cleanup or logging
    process.exit(1); // Exit the process with a non-zero exit code
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Perform any necessary cleanup or logging
});

