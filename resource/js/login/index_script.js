// 1. Supabaseの初期設定
const SUPABASE_URL = 'https://aflmhkxgoxnwxerzhkqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbG1oa3hnb3hud3hlcnpoa3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDgsImV4cCI6MjA5NjUzMjc0OH0.zbs5qIWSULf3CKqTdLzXYm3FG-wT13KHsapnzDaHYnM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// PWAインストールプロンプト保持用変数
let deferredPrompt;

// --- PWAインストール機能 ---
window.addEventListener('beforeinstallprompt', (e) => {
    // 標準のポップアップを抑止
    e.preventDefault();
    deferredPrompt = e;
    // インストールボタンを表示
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.style.display = 'block';
});

// --- メイン処理 ---
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('google-login-btn');
    const installBtn = document.getElementById('pwa-install-btn');

    // Googleログインボタンの処理
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'https://school-voton.vercel.app/dashboard/index.html'
                }
            });
            if (error) console.error('Error:', error.message);
        });
    }

    // インストールボタンの処理
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            // インストールダイアログを表示
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User choice: ${outcome}`);
            
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    }
});

// インストール完了時のログ
window.addEventListener('appinstalled', () => {
    console.log('App was installed.');
});