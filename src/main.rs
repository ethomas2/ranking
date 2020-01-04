#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;

use std::env;
use std::error;
use std::fs;
use std::io;

type Result<T> = std::result::Result<T, Box<dyn error::Error>>;

#[get("/")]
fn get() -> &'static str {
    "Hello, world!"
}

#[post("/elections")]
fn post() -> Result<String> {
    Ok(String::from("success"))
}

fn create_db_dir() -> Result<String> {
    // TODO: add a load_config fn that you call as first line of main() that loads this into a
    // global config variable
    let DEFAULT_DB_DIR = String::from("db");

    let db_dir_result: Result<String> = match env::var("APP_DB_DIR") {
        Ok(x) => Ok(x),
        Err(env::VarError::NotPresent) => Ok(DEFAULT_DB_DIR),
        Err(x) => Err(Box::new(x)),
    };
    let db_dir = db_dir_result?;

    // create dir and change ErrorKind to pass
    if let Err(e) = fs::create_dir(&db_dir) {
        if e.kind() != io::ErrorKind::AlreadyExists {
            Err(e)?;
        }
    }

    Ok(db_dir)
}

fn main() {
    if let Err(e) = create_db_dir() {
        println!("{}", e);
        std::process::exit(1);
    }

    rocket::ignite().mount("/", routes![get, post]).launch();
}
