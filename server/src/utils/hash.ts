import bcrypt from 'bcrypt';

const saltRounds = 10;

/**
 * 
 * @param text plaintText
 * @returns the hashed string
 */
export async function hash(text : string){
    return (await bcrypt.hash(text,saltRounds))
}

/**
 *  
 * @param text plain text
 * @param hashedText hashed text
 * @returns true if the hashed strings match
 */
export async function compareHash(text : string, hashedText : string){
    return (await bcrypt.compare(text,hashedText))
}