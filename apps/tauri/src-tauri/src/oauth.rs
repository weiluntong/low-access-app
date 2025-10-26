use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::{oneshot, Mutex};
use warp::Filter;
use tauri::Manager;

// OAuth callback HTML page - extracted to separate file for easier editing
const OAUTH_CALLBACK_HTML: &str = include_str!("oauth_callback.html");

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthServerInfo {
    pub callback_url: String,
    pub port: u16,
}

// Global state for OAuth callback
struct OAuthState {
    receiver: Option<oneshot::Receiver<String>>,
    server_handle: Option<tokio::task::JoinHandle<()>>,
}

static OAUTH_STATE: once_cell::sync::Lazy<Arc<Mutex<OAuthState>>> = once_cell::sync::Lazy::new(|| {
    Arc::new(Mutex::new(OAuthState {
        receiver: None,
        server_handle: None,
    }))
});

#[tauri::command]
pub async fn start_oauth_server() -> Result<OAuthServerInfo, String> {
    // Create a oneshot channel to receive the id_token
    let (tx, rx) = oneshot::channel::<String>();
    let tx = Arc::new(Mutex::new(Some(tx)));
    let tx_clone = tx.clone();

    // Create callback HTML page route
    let callback_html = warp::path("callback")
        .and(warp::path::end())
        .map(|| warp::reply::html(OAUTH_CALLBACK_HTML));

    // Create result handler that receives the token from JavaScript
    let result_handler = warp::path!("callback" / "result")
        .and(warp::query::<std::collections::HashMap<String, String>>())
        .and_then(move |params: std::collections::HashMap<String, String>| {
            let tx = tx_clone.clone();
            async move {
                if let Some(error) = params.get("error") {
                    if let Some(sender) = tx.lock().await.take() {
                        let _ = sender.send(format!("ERROR: {}", error));
                    }
                } else if let Some(id_token) = params.get("id_token") {
                    if let Some(sender) = tx.lock().await.take() {
                        let _ = sender.send(id_token.clone());
                    }
                }
                Ok::<_, warp::Rejection>(warp::reply::with_status("OK", warp::http::StatusCode::OK))
            }
        });

    let routes = callback_html.or(result_handler);

    // Try to bind to a port in the range 38714-38724
    let mut server_handle = None;
    let mut bound_port = None;

    for port in 38714..=38724 {
        match tokio::net::TcpListener::bind(("127.0.0.1", port)).await {
            Ok(listener) => {
                let server = warp::serve(routes.clone());
                let handle = tokio::spawn(async move {
                    server.run_incoming(tokio_stream::wrappers::TcpListenerStream::new(listener)).await;
                });
                server_handle = Some(handle);
                bound_port = Some(port);
                break;
            }
            Err(_) => continue,
        }
    }

    let port = bound_port.ok_or_else(|| "Failed to bind to any port in range 38714-38724".to_string())?;
    let callback_url = format!("http://localhost:{}/callback", port);

    // Store the receiver and server handle in global state
    {
        let mut state = OAUTH_STATE.lock().await;
        state.receiver = Some(rx);
        state.server_handle = server_handle;
    }

    Ok(OAuthServerInfo {
        callback_url,
        port,
    })
}

#[tauri::command]
pub async fn wait_for_oauth_token(app_handle: tauri::AppHandle) -> Result<String, String> {
    // Get the receiver from global state
    let rx = {
        let mut state = OAUTH_STATE.lock().await;
        state.receiver.take()
            .ok_or_else(|| "No OAuth server running".to_string())?
    };
    
    // Wait for the callback with timeout (5 minutes)
    let result = tokio::time::timeout(
        tokio::time::Duration::from_secs(300),
        rx
    ).await;
    
    // Clean up: abort the server and clear state
    {
        let mut state = OAUTH_STATE.lock().await;
        if let Some(handle) = state.server_handle.take() {
            handle.abort();
        }
    }

    // Close the OAuth popup window
    if let Some(window) = app_handle.get_webview_window("oauth-popup") {
        let _ = window.close();
    }
    
    match result {
        Ok(Ok(token)) => {
            if token.starts_with("ERROR: ") {
                Err(token)
            } else {
                Ok(token)
            }
        }
        Ok(Err(_)) => Err("Callback channel closed unexpectedly".to_string()),
        Err(_) => Err("OAuth timeout - user took too long to authenticate".to_string()),
    }
}

#[tauri::command]
pub async fn open_oauth_window(oauth_url: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    let url = match oauth_url.parse::<url::Url>() {
        Ok(u) => u,
        Err(e) => {
            return Err(format!("Invalid URL: {}", e));
        }
    };

    let _oauth_window = tauri::WebviewWindowBuilder::new(
        &app_handle,
        "oauth-popup",
        tauri::WebviewUrl::External(url)
    )
    .title("Google Sign In")
    .inner_size(500.0, 600.0)
    .center()
    .resizable(false)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}
