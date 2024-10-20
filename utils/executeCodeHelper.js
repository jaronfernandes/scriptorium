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
export default async function executeCodeHelper(inputCode, language, userInput) {
    //TODO: Continue implementation
    let command;

    try {
        // Call the compileCode method to compile the code
        command = await compileCode(inputCode, language);

        // Execute the input command
        const { stdout, stderr } = await execAsync(command);

        // Return the JSON object result. Handle in diff cases based on whether stderr is null or not
        if (stderr == null){
            return { output: stdout};
        } else {
            return { output: stdout, error: stderr};
        }
    } catch (error) {
        // Handle any errors that occur during execution
        return { output: null, error: error.message };
    }

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
    
    TODOS:
        1. Handle user input (either here or in executeCodeHelper)
        2. Implement support for JS (similar to Python)
        3. Think about how to implement for all languages in category B (Java, C, C++ )
*/
async function compileCode (inputCode, language){

    let codeCommand; // Defining a variable to store the command to compile the code

    // Creating a regex pattern to clean up input code. (Reference: ChatGPT)
    const regexCleanInputCode = inputCode
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/[\n]/g, '\\n') // Escape newlines
    .trim(); // Trim any leading or trailing whitespace

    if (language === "python"){
        // the -c command tells python to execute inputCode as a string not a file
        // Futhermore, need to put "" around the template literal (${}) to make it interpret as a string
        codeCommand = `python3 -c "${regexCleanInputCode}"`; 
    }
    // else if (language == "javascript"){ //TODO: Commented out, not implemented yet
    //     
    // }
    // TODO: Implemenent support for the other 3 languages (Java, C, C++)
    else{
        throw new Error('Unsupported language');
        
    }
    return codeCommand;
}



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