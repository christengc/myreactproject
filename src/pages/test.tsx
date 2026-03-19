import React, {useState} from 'react';

type HelloWorldProps  = {
    name: string
}

const HelloWorld = function( { name = "HAL 2000" }: HelloWorldProps ) {
    const [inputValue, setInputValue] = useState(name);
    const [greeting, setGreeting] = useState("Hello, " + name + "!");


    return  <div>
                <div>{greeting}</div>
                <button style={{ backgroundColor: "red" }} onClick={() => setGreeting("Hello, " + inputValue + "! Nice to meet you!")}>Try me out</button>
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={
                        (e) => { 
                            setInputValue(e.target.value); 
                            setGreeting("Hello, " + e.target.value + "!");
                        }   
                    }
                />
            </div>;

}

export default HelloWorld;