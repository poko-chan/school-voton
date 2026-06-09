// 1. Supabaseの初期設定
const SUPABASE_URL = 'https://aflmhkxgoxnwxerzhkqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbG1oa3hnb3hud3hlcnpoa3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDgsImV4cCI6MjA5NjUzMjc0OH0.zbs5qIWSULf3CKqTdLzXYm3FG-wT13KHsapnzDaHYnM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const userInfoDiv = document.getElementById('user-info');
    const settingsBtn = document.getElementById('settings-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // 2. ログインユーザー情報を取得
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('認証エラー、またはセッションがありません:', error);
        if (userInfoDiv) userInfoDiv.innerText = 'ログインセッションがありません。ログイン画面に戻ります。';
        setTimeout(() => { window.location.href = '../login/index.html'; }, 2000);
        return;
    }

    const userUID = user.id;

    // 3. データベース（profiles）から、現在の最新データを取得する
    // ※Googleのデータではなく、データベースに既にある名前（設定画面で変えた名前）を優先するため
    const { data: existingProfile, error: selectError } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('user_id', userUID)
        .single();

    if (selectError && selectError.code !== 'PGRST116') { 
        console.error('データベース確認エラー:', selectError.message);
    }

    let displayName = '';

    if (existingProfile) {
        // 【既存ユーザーの場合】
        // 設定画面等で変更された「データベース内の名前」をそのまま画面に表示（上書きしない！）
        console.log('既存ユーザーです。データベースのデータをそのまま使用します。');
        displayName = existingProfile.full_name;
    } else {
        // 【完全に新規のユーザーの場合のみ】
        // 初めてのログインなので、Googleのデータをデータベースに新規保存（insert）する
        console.log('新規ユーザーです。プロファイルを作成します。');
        
        const googleName = user.user_metadata.full_name || user.email;
        const googleAvatar = user.user_metadata.avatar_url || '';
        displayName = googleName;

        const { error: insertError } = await supabaseClient
            .from('profiles')
            .insert({ 
                user_id: userUID,
                full_name: googleName,
                avatar_url: googleAvatar
            });

        if (insertError) {
            console.error('新規登録エラー:', insertError.message);
        }
    }

    // 4. 確定した名前（既存ならDBの名前、新規ならGoogleの名前）を画面に表示
    if (userInfoDiv) {
        userInfoDiv.innerText = `ようこそ、${displayName} さん！`;
    }
    
    // URLの後ろの長いトークンを消す
    window.history.replaceState({}, document.title, window.location.pathname);

    // --- ボタンのイベント処理 ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = '../settings/index.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const { error: logoutError } = await supabaseClient.auth.signOut();
            if (logoutError) {
                alert('ログアウトに失敗しました: ' + logoutError.message);
            } else {
                window.location.href = '../login/index.html';
            }
        });
    }
});