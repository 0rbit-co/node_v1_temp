import { dryrun } from "@permaweb/aoconnect";


export const readGetRequests = async () => {
    try {
        const { Error, Messages } = await dryrun({
            // process: "4_jJUtiNjq5Xrg8OMrEDo-_bud7p5vbSJh1e69VJ76U",
            process: "WSXUI2JjYUldJ7CKq9wE1MGwXs-ldzlUlHOQszwQe0s",
            tags: [{ name: "Read", value: "GET_REQUESTS" }],
        })
        if (Error) throw Error
        if (!Messages[0] || !Messages[0].Data) throw new Error("Unable to read the message")
        return Messages[0].Data
    } catch (error) {
        console.error(error)
    }
}
