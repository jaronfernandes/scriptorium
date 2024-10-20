/*
    Helper file to file: utils/executeCode.js

*/

//Imports
import { exec } from 'child_process';
import { promisify } from 'util';

// Recommendation from ChatGPT: Promisify exec to use async/await
// Purpose: exec is the library that helps "execute" the code at a low level
// Reason: Makes it easier to AWAIT output executed from exec. Allows us to use words like async and await
const execAsync = promisify(exec);

//Actual method implementation
export default function executeCodeHelper(inputCode, language, userInput) {

}

/*
    Helper method to executeCodeHelper (compileCode)

    This method handles the compilation of code in 2 different cases

    Case A:
        Languages: Python, Javascript (via Node.js)

        These languages are interpreted, meaning that we don't need to make a temp file and execute them
        The idea is to execute stuff in <inputCode> as a string

    Case B:
        Languages: Java, C, C++

        These languages need to be compiled, so the steps for execution are: 
            1. Create a temporary file containin <inputCode>
            2. Compile this file
            3. [NOT IN THIS METHOD, LATER ON]: Delete this file
*/



//[OLD]: DUMMY IMPLEMENTATION of executeCodeHelper, to test whether endpoint is working
// export default function executeCodeHelper(inputCode, language, userInput) {
//     // Simulate code execution and return a dummy JSON object
//     return {
//         status: 'success',
//         language,
//         inputCode,
//         userInput,
//         output: `Executed code successfully in ${language}.`, // Simulated output
//     };
// }