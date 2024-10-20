/*
    User story to satisfy:

        1. As a visitor, I want to execute my code on Scriptorium and see the output in real-time so that I can quickly verify its correctness.


    Assumptions:

    From Piazza note @220, just assume that ALL the user input is given in 1 go
    Ie: Thinking of the program running as: You give it all the input at once, and it gives you all the output at once
    
    
    Note:

        - Did not put this in a nested folder (eg: user or admin) because this route is accessible to all (accesible to the lowest level, visitor)

*/

//Imports
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

//Handler
export default async function handler(req, res){

    // Checking if request type is correct
    if (req.method != "POST"){
        return res.status(405).json({error: "Method not supported"});
    }

    // Get POST body content
    const {inputCode, language, userInput} = req.body;

    // Check if required fields are defined 
    // Here, assume required fields are: inputCode and language
    if (!inputCode || !language){
        return res.status(400).json({message: "Missing input code or language"});
    }
    
}