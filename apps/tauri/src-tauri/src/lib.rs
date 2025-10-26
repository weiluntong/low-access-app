mod oauth;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TailscaleStatus {
    pub status: String,
    pub message: String,
}

#[tauri::command]
async fn run_tailscale_command(command: String) -> Result<String, String> {
    Ok(format!("Tailscale command '{}' would run here (desktop-only feature)", command))
}

#[tauri::command]
async fn get_tailscale_status() -> Result<TailscaleStatus, String> {
    Ok(TailscaleStatus {
        status: "disconnected".to_string(),
        message: "Tailscale integration coming soon for desktop".to_string(),
    })
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            run_tailscale_command,
            get_tailscale_status,
            oauth::start_oauth_server,
            oauth::wait_for_oauth_token,
            oauth::open_oauth_window,
        ])
        .setup(|_app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
