// tasks.ts
async function repeatTask1() {
    while (true) {
        console.log('Task 1 is running');
        await doSomething1();
        await new Promise(resolve => setImmediate(resolve));
    }
}

async function repeatTask2() {
    while (true) {
        console.log('Task 2 is running');
        await doSomething2();
        await new Promise(resolve => setImmediate(resolve));
    }
}

async function doSomething1() {
    console.log('Doing something in Task 1');
    await delay(500);  // Simulates processing time
}

async function doSomething2() {
    console.log('Doing something in Task 2');
    await delay(500);  // Simulates processing time
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function main() {
    repeatTask1();
    repeatTask2();
}

main();
