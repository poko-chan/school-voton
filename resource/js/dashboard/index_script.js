// 1. Supabaseの初期設定
const SUPABASE_URL = 'https://aflmhkxgoxnwxerzhkqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbG1oa3hnb3hud3hlcnpoa3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDgsImV4cCI6MjA5NjUzMjc0OH0.zbs5qIWSULf3CKqTdLzXYm3FG-wT13KHsapnzDaHYnM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. 画面が開いたらトークンを解析してユーザー情報を取得
document.addEventListener('DOMContentLoaded', async () => {
    const userInfoDiv = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn'); // ログアウトボタンを取得

    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        // 認証エラー、またはセッションが無い場合はログイン画面へ
        console.error('認証エラー、またはセッションがありません:', error);
        if (userInfoDiv) userInfoDiv.innerText = 'ログインセッションがありません。ログイン画面に戻ります。';
        
        setTimeout(() => {
            window.location.href = '../login/index.html';
        }, 2000);
    } else {
        // ログイン成功！
        console.log('ログイン成功:', user);
        
        const userName = user.user_metadata.full_name || user.email;
        if (userInfoDiv) {
            userInfoDiv.innerText = `ようこそ、${userName} さん！`;
        }
        
        window.history.replaceState({}, document.title, window.location.pathname);

        // --- 👇 ここからログアウトの処理を追記 👇 ---
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                console.log('ログアウト処理を開始します...');
                
                // Supabaseからサインアウト
                const { error: logoutError } = await supabaseClient.auth.signOut();

                if (logoutError) {
                    console.error('ログアウトエラー:', logoutError.message);
                    alert('ログアウトに失敗しました: ' + logoutError.message);
                } else {
                    console.log('ログアウト成功。ログイン画面に移動します。');
                    // ログアウトが成功したら、ログイン画面に戻す
                    window.location.href = '../login/index.html';
                }
            });
        }
        // --- 👆 ここまで 👆 ---
    }
});