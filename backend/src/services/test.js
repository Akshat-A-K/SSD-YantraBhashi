// Assuming the SubmissionService class is loaded
const submissionService = new SubmissionService();

const testCases = [
    // Valid Code: Simple print example
    {
        code: `
        PADAM message:VARTTAI = "Hello World";
        CHATIMPU(message);
        `,
        expectedErrors: []
    },

    // Valid Code: Addition program with user input
    {
        code: `
        PADAM a:ANKHE;
        PADAM b:ANKHE;
        PADAM sum:ANKHE = 0;
        CHEPPU(a);
        CHEPPU(b);
        sum = a + b;
        CHATIMPU("The Sum is:");
        CHATIMPU(sum);
        `,
        expectedErrors: []
    },

    // Valid Code: Conditional statement
    {
        code: `
        PADAM username:VARTTAI;
        CHEPPU(username);
        ELAITHE (username == "Anirudh") [
            CHATIMPU("Welcome Anirudh!");
        ] ALAITHE [
            CHATIMPU("Access Denied!");
        ]
        `,
        expectedErrors: []
    },

    // Valid Code: Loop to sum first 10 numbers
    {
        code: `
        PADAM i:ANKHE;
        PADAM sum:ANKHE = 0;
        MALLI-MALLI (PADAM i:ANKHE = 1; i <= 10; i = i + 1) [
            sum = sum + i;
        ]
        CHATIMPU("Sum of first 10 numbers is:");
        CHATIMPU(sum);
        `,
        expectedErrors: []
    },

    // Invalid Code: Undeclared variable usage
    {
        code: `
        PADAM sum:ANKHE;
        sum = a + b;
        `,
        expectedErrors: [
            { line: 2, message: "Undeclared variable 'a'." },
            { line: 2, message: "Undeclared variable 'b'." }
        ]
    },

    // Invalid Code: Reserved word as variable name
    {
        code: `
        PADAM VARTTAI:VARTTAI = "Test";
        `,
        expectedErrors: [
            { line: 1, message: "Variable name 'VARTTAI' is reserved." }
        ]
    },

    // Invalid Code: Missing semicolon
    {
        code: `
        PADAM a:ANKHE
        `,
        expectedErrors: [
            { line: 1, message: "Missing semicolon." }
        ]
    },

    // Invalid Code: Malformed loop header (missing increment)
    {
        code: `
        MALLI-MALLI (PADAM i:ANKHE = 1; i <= 10; ) [
            sum = sum + i;
        ]
        `,
        expectedErrors: [
            { line: 1, message: "Invalid MALLI-MALLI syntax." }
        ]
    },

    // Invalid Code: Invalid condition in if statement
    {
        code: `
        PADAM age:ANKHE;
        ELAITHE (age == "20") [
            CHATIMPU("Age matched!");
        ]
        `,
        expectedErrors: [
            { line: 2, message: "Invalid condition in ELAITHE." }
        ]
    }
];

function runTests() {
    testCases.forEach((test, index) => {
        console.log(`Running test case ${index + 1}...`);
        const errors = submissionService.validate_code(test.code);
        const testPassed = JSON.stringify(errors) === JSON.stringify(test.expectedErrors);

        console.log(`Test ${index + 1} ${testPassed ? 'Passed' : 'Failed'}`);
        if (!testPassed) {
            console.log('Expected Errors:', JSON.stringify(test.expectedErrors, null, 2));
            console.log('Returned Errors:', JSON.stringify(errors, null, 2));
        }
        console.log('---------------------------');
    });
}

runTests();
