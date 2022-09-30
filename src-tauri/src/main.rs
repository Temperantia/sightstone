#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use reqwest::header::AUTHORIZATION;

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

#[tauri::command]
async fn league_request(
    url: String,
    method: String,
    body: String,
    authorization: String,
) -> String {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();
    let mut request;
    if method == "POST" {
        request = client.post(url).body(body);
    } else {
        request = client.get(url);
    }
    request = request.header(AUTHORIZATION, authorization);
    let result = request.send().await;
    let text = result.unwrap().text().await;
    return text.unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![league_request, my_custom_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
