#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;

use rocket_contrib::json::JsonValue;

use std::env;
use std::error;
use std::fs::{self, File};
use std::io;
use std::result;

type Result<T> = std::result::Result<T, Box<dyn error::Error>>;

static DB_DIR: &str = "db"; // TODO: should be read in by config
static VERSION: &str = "version";

#[get("/")]
fn get() -> &'static str {
    "Hello, world!"
}

#[post("/elections")]
fn post() -> Result<JsonValue> {
    let dir_entres = fs::read_dir(DB_DIR)?
        .collect::<result::Result<Vec<fs::DirEntry>, io::Error>>()?;

    // TODO: get rid of these unwraps
    let filenames = dir_entres.into_iter().map(|dir_entry| {
        dir_entry
            .file_name()
            .into_string()
            .unwrap() // turning filename into string can fail if filename is not utf8 encodeable
            .parse::<i64>()
            .unwrap()
    });
    let next_election_id = filenames.fold(0, i64::max) + 1;

    fs::write(
        format!("db/{}", next_election_id),
        json!({
            "id": next_election_id,
            "body": [],
            "header": [],
            "leftCol": [],
            "title": format!("My Title - {}", next_election_id),
            VERSION: 0,
        })
        .to_string(),
    )?;

    Ok(json!({ "id": next_election_id }))
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
