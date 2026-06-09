// 1. Supabaseの初期設定
const SUPABASE_URL = 'https://aflmhkxgoxnwxerzhkqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbG1oa3hnb3hud3hlcnpoa3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDgsImV4cCI6MjA5NjUzMjc0OH0.zbs5qIWSULf3CKqTdLzXYm3FG-wT13KHsapnzDaHYnM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. 画面が開いたらトークンを解析してユーザー情報を取得
document.addEventListener('DOMContentLoaded', async () => {
    const userInfoDiv = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');

    // SupabaseがURLの後ろの #access_token=... を自動解析してユーザー情報を取得
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        // ログインセッションが無い、またはエラーの場合はログイン画面へ戻す
        console.error('認証エラー、またはセッションがありません:', error);
        if (userInfoDiv) userInfoDiv.innerText = 'ログインセッションがありません。ログイン画面に戻ります。';
        
        setTimeout(() => {
            window.location.href = '../login/index.html';
        }, 2000);
        return; // 処理を終了
    }

    // --- 👇 ここからデータベース（int8主キー設計）の処理 👇 ---
    
    const userUID = user.id; // Googleログインから発行されたUUID
    const userName = user.user_metadata.full_name || user.email;
    const userAvatar = user.user_metadata.avatar_url || '';

    // 1. すでにこの user_id (UUID) が profiles テーブルに登録されているか確認
    const { data: existingProfile, error: selectError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('user_id', userUID)
        .single(); // 1件だけ取得

    // PGRST116 は「データが見つからない」という正常なエラーコードなので、それ以外をエラーログに出す
    if (selectError && selectError.code !== 'PGRST116') { 
        console.error('データベース確認エラー:', selectError.message);
    }

    let dbError;

    if (existingProfile) {
        // 2-A. すでに登録されているユーザーの場合は【更新 (update)】
        console.log('既存ユーザーです。プロファイルを更新します。');
        const { error } = await supabaseClient
            .from('profiles')
            .update({ 
                full_name: userName,
                avatar_url: userAvatar
            })
            .eq('user_id', userUID);
        dbError = error;
    } else {
        // 2-B. 初めてのユーザーの場合は【新規追加 (insert)】
        // ※ id (int8) はデータベース側で自動連番（1, 2, 3...）が振られるため指定不要です
        console.log('新規ユーザーです。プロファイルを作成します。');
        const { error } = await supabaseClient
            .from('profiles')
            .insert({ 
                user_id: userUID, // GoogleのUIDをここに保存
                full_name: userName,
                avatar_url: userAvatar
            });
        dbError = error;
    }

    if (dbError) {
        console.error('データベース同期エラー:', dbError.message);
    } else {
        console.log('データベースとの同期が正常に完了しました！');
    }

    // --- 👆 データベース処理ここまで 👆 ---

    // ログインユーザーの名前を画面に表示
    if (userInfoDiv) {
        userInfoDiv.innerText = `ようこそ、${userName} さん！`;
    }
    
    // URLの後ろの長いトークン（#access_token=...）をブラウザの履歴から消して見た目をスッキリさせる
    window.history.replaceState({}, document.title, window.location.pathname);

    // ログアウトボタンの処理
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            console.log('ログアウト処理を開始します...');
            const { error: logoutError } = await supabaseClient.auth.signOut();

            if (logoutError) {
                console.error('ログアウトエラー:', logoutError.message);
                alert('ログアウトに失敗しました: ' + logoutError.message);
            } else {
                console.log('ログアウト成功。ログイン画面に移動します。');
                window.location.href = '../login/index.html';
            }
        });
    }
});