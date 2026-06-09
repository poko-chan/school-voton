const SUPABASE_URL = 'https://aflmhkxgoxnwxerzhkqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbG1oa3hnb3hud3hlcnpoa3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDgsImV4cCI6MjA5NjUzMjc0OH0.zbs5qIWSULf3CKqTdLzXYm3FG-wT13KHsapnzDaHYnM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const userInfoDiv = document.getElementById('user-info');
    const userAvatarImg = document.getElementById('user-avatar'); // 追加
    const settingsBtn = document.getElementById('settings-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('認証エラー:', error);
        if (userInfoDiv) userInfoDiv.innerText = 'ログインセッションがありません。';
        setTimeout(() => { window.location.href = '../login/index.html'; }, 2000);
        return;
    }

    const userUID = user.id;

    // データベースから full_name と avatar_url を両方持ってくる
    const { data: existingProfile, error: selectError } = await supabaseClient
        .from('profiles')
        .select('full_name, avatar_url') // avatar_urlを追加
        .eq('user_id', userUID)
        .single();

    if (selectError && selectError.code !== 'PGRST116') { 
        console.error('データベース確認エラー:', selectError.message);
    }

    let displayName = '';
    let displayAvatar = ''; // 追加

    if (existingProfile) {
        console.log('既存ユーザーです。');
        displayName = existingProfile.full_name;
        displayAvatar = existingProfile.avatar_url; // 追加
    } else {
        console.log('新規ユーザーです。プロファイルを作成します。');
        
        const googleName = user.user_metadata.full_name || user.email;
        const googleAvatar = user.user_metadata.avatar_url || '';
        displayName = googleName;
        displayAvatar = googleAvatar; // 追加

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

    // 画面への反映
    if (userInfoDiv) {
        userInfoDiv.innerText = `ようこそ、${displayName} さん！`;
    }
    
    // アバター画像があれば表示（追加）
    if (userAvatarImg && displayAvatar) {
        userAvatarImg.src = displayAvatar;
        userAvatarImg.style.display = 'block'; // 非表示解除
    } else if (userAvatarImg) {
        userAvatarImg.style.display = 'none'; // 画像URLが無ければ隠す
    }
    
    window.history.replaceState({}, document.title, window.location.pathname);

    // ボタンのイベント処理
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