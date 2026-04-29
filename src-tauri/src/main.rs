#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(any(debug_assertions, feature = "release-devtools"))]
use tauri::Manager;

#[cfg(any(debug_assertions, feature = "release-devtools"))]
fn env_flag(name: &str) -> Option<bool> {
    std::env::var(name)
        .ok()
        .map(|value| value.trim().to_ascii_lowercase())
        .and_then(|value| match value.as_str() {
            "1" | "true" | "yes" | "on" => Some(true),
            "0" | "false" | "no" | "off" => Some(false),
            _ => None,
        })
}

#[cfg(any(debug_assertions, feature = "release-devtools"))]
fn should_open_devtools() -> bool {
    env_flag("TAURI_DEVTOOLS") == Some(true)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(any(debug_assertions, feature = "release-devtools"))]
            {
                if should_open_devtools() {
                    if let Some(webview) = app.get_webview_window("main") {
                        webview.open_devtools();
                    }
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
