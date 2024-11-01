/*
    Helper file to file: utils/executeCode.js

*/

//Imports
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs'; // java specific import

// Recommendation from ChatGPT: Promisify exec to use async/await
// Purpose: exec is the library that helps "execute" the code at a low level
// Reason: Makes it easier to AWAIT output executed from exec. Allows us to use words like async and await
const execAsync = promisify(exec);

//Actual method implementation
export default async function executeCodeHelper(inputCode, language, stdin) {
    try {
        // Call the compileCode method to compile the code
        let codeCommand = await compileCode(inputCode, language, stdin);

        // Execute the input command
        let { stdout, stderr } = await execAsync(codeCommand);
        // Return the JSON object result. Handle in diff cases based on whether stderr is null or not
        if (stderr == null){
            return { output: stdout};
        } 
        else {
            return { output: stdout, error: stderr};
        }
    } catch (error) {
        // Handle any errors that occur during execution
        return { output: null, error: error.message };
    }

}

/*
    Docstring for regexCleaningInput

    Helper method to compileCode

    Purpose: Taking a string, and using regex to clean up the string contents for POST endpoint execution. 
    Using regex, the following cleaning is done:

        1. Escaping double quotes 
        2. Escaping single quotes
        3. Escaping newlines 
        4. Getting rid of trailing and leading whitespace
*/

function regexCleaningInput(language, inputString){
    // Note: Using the optional chaining operator (?.) to safely handle cases where inputString is null
    //FIXME: One massive assumption: We assume all lines of code are escaped by a \n, therefore the regex does NOT escape them
    
    if (language === "python" || language === "javascript"){
        let cleanedInputString = inputString
        ?.replace(/\\/g, '\\\\') // Escape backslashes
        ?.replace(/"/g, '\\"') // Escape double quotes
        ?.replace(/'/g, "\\'") // Escape single quotes
        ?.trim(); // Trim any leading or trailing whitespace
        return cleanedInputString;
    }

    else if (language === "java"){
        let cleanedInputString = inputString
        ?.replace(/'/g, "\\'") // Escape single quotes
        ?.trim(); // Trim any leading or trailing whitespace
        return cleanedInputString;
    }

    
    //Old reference code
    // let cleanedInputString = inputString
    // ?.replace(/\\/g, '\\\\') // Escape backslashes
    // ?.replace(/"/g, '\\"') // Escape double quotes
    // ?.replace(/'/g, "\\'") // Escape single quotes
    // ?.trim(); // Trim any leading or trailing whitespace
    // return cleanedInputString;
    
    // // return inputString
    // // ?.replace(/\\/g, '\\\\') // Escape backslashes
    // // ?.trim(); // Trim leading and trailing whitespace
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
async function compileCode (inputCode, language, stdin){

    let codeCommand; // Defining a variable to store the command to compile the code

    // Creating a regex pattern to clean up input code. (Reference: ChatGPT)
    let cleanedInputCode = regexCleaningInput(language, inputCode);
    let cleanedStdin = regexCleaningInput(language, stdin);

    if (language === "python"){
        // the -c command tells python to execute inputCode as a string not a file
        // Futhermore, need to put "" around the template literal (${}) to make it interpret as a string
        // codeCommand = `python3 -c "${cleanedInputCode}"`; 
        codeCommand = `echo "${cleanedStdin}" | python3 -c "${cleanedInputCode}"`
    }
    else if (language === "javascript"){
        // We use node.js to run javascript commands
        // The "-e" flag, like how -c is used for python, tells node.js to execute the command 
        codeCommand = `echo "${cleanedStdin}" | node -e "${cleanedInputCode}"`; 
    }
    else if (language === "java"){
        // Unlike Python and JS, Java is a compiled language
        // Therefore, we need to write the code to another temporary file and compile that file to have it execute

        //FIXME: Need to review whether this assumption holds true
        // Need to extract the class name from the file so that we can name the temporary file the same
        // NOT matching the names will lead to errors like : "error: class HelloWorld is public, should be declared in a file named HelloWorld.java"
        let findingJavaClassName = cleanedInputCode.match(/public\s+class\s+(\w+)/);
        let tempJavaFileName = findingJavaClassName[1];

        // Write the code to a temporary file
        //using writeFileSync as this is async function => forces program to wait for input code to be written
        fs.writeFileSync(`${tempJavaFileName}.java`, cleanedInputCode);

        //Compile that file (to a .class)
        await execAsync(`javac ${tempJavaFileName}.java`);

        //Execute the code found in this class file
        codeCommand = `echo "${cleanedStdin}" | java ${tempJavaFileName}`;

    }
    
    // TODO: Implemenent support for the other 3 languages (Java, C, C++)
    else{
        throw new Error('Unsupported language');
        
    }
    return codeCommand
}