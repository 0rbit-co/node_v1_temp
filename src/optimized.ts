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
    async function cron() {
        while (true) {
            console.info("Cron job triggered");
            try {
                await Promise.all([
                    processRequests(GET),
                    processRequests(POST)
                ]);
            } catch (error) {
                console.error("Error occurred in the cron loop:", error);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay before the next iteration
            console.info("Cron job completed");
        }
    }

    async function processRequests(method: string) {
        console.info(`Recieved ${method} request`)
        const messageData = method === GET ? await readGetRequests() : await readPostRequests();
        const requests = JSON.parse(messageData);
        console.log(requests)
        if (Object.keys(requests).length === 0) throw `No ${method} requests to process.`;

        // TODO: Add logic for choosing request
        const reqKey = Object.keys(requests)[0];
        const req = requests[reqKey];

        const commonTags = [
            { name: "Request-Type", value: method },
            { name: "Action", value: "Recieve-Response" },
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


    cron()
}