// 1. Supabaseの初期設定
const SUPABASE_URL = 'https://aflmhkxgoxnwxerzhkqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbG1oa3hnb3hud3hlcnpoa3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDgsImV4cCI6MjA5NjUzMjc0OH0.zbs5qIWSULf3CKqTdLzXYm3FG-wT13KHsapnzDaHYnM';

// Supabaseクライアントの初期化
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. 画面の準備ができたらボタンのクリックイベントを設定
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('google-login-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            console.log('Googleログインを開始します...');

            // SupabaseのOAuth（Google）認証を呼び出す
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // window.location.origin を使うことで、
                    // ローカルなら http://localhost:... 、本番なら https://school-voton.vercel.app を自動取得します
                    redirectTo: window.location.origin + '/dashboard/index.html' 
                }
            });

            if (error) {
                console.error('ログイン中にエラーが発生しました:', error.message);
                alert('ログインに失敗しました: ' + error.message);
            }
        });
    }
});