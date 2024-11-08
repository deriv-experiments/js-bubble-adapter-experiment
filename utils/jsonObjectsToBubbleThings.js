/*
    A utility function to convert JSON received from API calls to a bubble data things JSON format.
    It works by appending `_<typeof the value>` to the `key` of the object and helps us to get access to types in the editor. 
*/
const jsonObjectsToBubbleThings = (originalObject) => {
    if (Array.isArray(originalObject)) {
        // If the object is an array, recursively apply the function to each element
        return originalObject.map(item => jsonObjectsToBubbleThings(item));
    } else if (typeof originalObject === "object" && originalObject !== null) {
        // If the object is an object, create a new object with modified keys
        return Object.keys(originalObject).reduce((acc, key) => {
            // Prepend prefix to the key and apply the function recursively on the value
            const newKey = "_api_c2_" + key;
            acc[newKey] = jsonObjectsToBubbleThings(originalObject[key]);
            return acc;
        }, {});
    }
    // If it's neither an object nor an array, return the value as it is
    return originalObject;
};

export default jsonObjectsToBubbleThings;