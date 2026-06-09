// 1. Supabaseの初期設定
const SUPABASE_URL = 'https://aflmhkxgoxnwxerzhkqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbG1oa3hnb3hud3hlcnpoa3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDgsImV4cCI6MjA5NjUzMjc0OH0.zbs5qIWSULf3CKqTdLzXYm3FG-wT13KHsapnzDaHYnM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. 画面が開いたらトークンを解析してユーザー情報を取得
document.addEventListener('DOMContentLoaded', async () => {
    const userInfoDiv = document.getElementById('user-info');

    // SupabaseがURLの後ろの #access_token=... を自動で読み取ってログインを完了させます
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        // トークンが無い、またはエラーの場合はログイン画面へ強制送還
        console.error('認証エラー、またはセッションがありません:', error);
        if (userInfoDiv) userInfoDiv.innerText = 'ログインセッションがありません。ログイン画面に戻ります。';
        
        setTimeout(() => {
            window.location.href = '../login/index.html';
        }, 2000);
    } else {
        // ログイン成功！
        console.log('ログイン成功:', user);
        
        // Googleアカウントの登録名を表示（無ければメールアドレス）
        const userName = user.user_metadata.full_name || user.email;
        if (userInfoDiv) {
            userInfoDiv.innerText = `ようこそ、${userName} さん！`;
        }
        
        // URLの後ろの長すぎる #access_token=... をブラウザの履歴から消してスッキリさせる
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});