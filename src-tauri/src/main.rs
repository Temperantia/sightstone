#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

const PATH_TO_LOCKFILE: &str = if cfg!(windows) {
    "C:/Riot Games/League of Legends/lockfile"
} else {
    "/Applications/League of Legends.app/Contents/LoL/lockfile"
};

#[tauri::command]
fn my_custom_command() -> String {
    let contents = std::fs::read_to_string(PATH_TO_LOCKFILE);
    match contents {
        Ok(v) => return v,
        Err(_e) => return String::from(""),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![my_custom_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
