#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;

// use std::fs;
use std::fs::File;
use std::io::prelude::*;

#[get("/")]
fn get() -> &'static str {
    "Hello, world!"
}

#[post("/")]
fn post() -> &'static str {
    // first ... assume dir exists and write thing into it
    File::create("elections/1").and_then(|file| file.write(b"foobar"));
    "foobar"

    // then check if dir doesn't exist and if it doesn't create it first
    // let dir_results = match fs::read_dir(".") {
    //     Ok(_) => "foobar",
    //     Err(_) => "error reading dir",
    // };
    // dir_results.any(|res| res == "entries")
    // dir_results
}

fn main() {
    rocket::ignite().mount("/", routes![get, post]).launch();
}
