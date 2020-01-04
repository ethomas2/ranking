#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;

// use std::boxed;
use std::env;
use std::error;
use std::fs;
use std::io;

type HeapError = Box<dyn error::Error>;

#[get("/")]
fn get() -> &'static str {
    "Hello, world!"
}

#[post("/elections")]
fn post() -> Result<String, HeapError> {
    let db_dir = get_db_dir()?;

    // create dir and change ErrorKind to pass
    if let Err(e) = fs::create_dir(db_dir) {
        if e.kind() != io::ErrorKind::AlreadyExists {
            Err(e)?;
        }
    }

    Ok(String::from("success"))
}

fn get_db_dir() -> Result<String, HeapError> {
    let default = String::from("db");

    let x = match env::var("APP_DB_DIR") {
        Ok(x) => Ok(x),
        Err(x) => {
            if x == env::VarError::NotPresent {
                return Ok(default);
            } else {
                return Err(Box::new(x));
            }
        }
    };
    return x;
}

fn main() {
    rocket::ignite().mount("/", routes![get, post]).launch();
}
