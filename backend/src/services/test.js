
const submissionService = new SubmissionService();

const testCases = [
    
    {
        code: `
        PADAM message:VARTTAI = "Hello World";
        CHATIMPU(message);
        `,
        expectedErrors: []
    },

    
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

    
    {
        code: `
        PADAM VARTTAI:VARTTAI = "Test";
        `,
        expectedErrors: [
            { line: 1, message: "Variable name 'VARTTAI' is reserved." }
        ]
    },

    
    {
        code: `
        PADAM a:ANKHE
        `,
        expectedErrors: [
            { line: 1, message: "Missing semicolon." }
        ]
    },

    
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
