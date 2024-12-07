use wasm_bindgen::prelude::*;

// This makes the function callable from JavaScript
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
