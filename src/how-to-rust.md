# Rocket/rust learnings
- https://rocket.rs/v0.4/guide/getting-started/#installing-rust

# cargo watch
- cargo watch https://docs.rs/crate/cargo-watch/7.3.0/source/README.md
- https://github.com/passcod/cargo-watch

# Questions
- why is Result<T, E> according to https://doc.rust-lang.org/std/result/ but Result<ReadDir> according to https://doc.rust-lang.org/std/fs/fn.read_dir.html
- Why can't I call file.write if I haven't imported `std::io::prelude::*`  but I have imported std::fs::File;

# Notes
- Option<T> is an enum

# Mistakes
- it's Some, not Ok
