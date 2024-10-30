const types = {
    BOOLEAN: 'boolean',
    DATE: 'date',
    NUMBER: 'number',
    TEXT: 'text',
};

const getValueType = (value) => {
    const type = typeof value;

    if (type === 'string') {
        return types.TEXT;
    }

    if (type === 'boolean') {
        return types.BOOLEAN;
    }

    if (type === 'number') {
        // TODO: add check for returning types.DATE if number is a valid unix epoch timestamp
        return types.NUMBER;
    }
};


/*
    A utility function to convert JSON received from API calls to a bubble data things JSON format.
    It works by appending `_<typeof the value>` to the `key` of the object and helps us to get access to types in the editor. 
*/
const jsonObjectsToBubbleThingsConverter = (originalObject) => {
    return Object.keys(originalObject).reduce((acc, key) => {
        let newKeyName = `${key}_${getValueType(originalObject[key]) ?? ''}`;
        acc[newKeyName] = originalObject[key];
        return acc;
    }, {})
};


/* --- Test --- */
const testObject = {
    name: "Alice",
    age: 25,
    city: "Wonderland",
    isStudent: false
};

console.log("Original JSON Object:")
console.log(testObject)
console.log("\nGenerated Bubble Object:")
console.log(jsonObjectsToBubbleThingsConverter(testObject))