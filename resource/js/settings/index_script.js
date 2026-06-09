const SUPABASE_URL = 'https://aflmhkxgoxnwxerzhkqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbG1oa3hnb3hud3hlcnpoa3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDgsImV4cCI6MjA5NjUzMjc0OH0.zbs5qIWSULf3CKqTdLzXYm3FG-wT13KHsapnzDaHYnM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const loadingMsg = document.getElementById('loading-msg');
    const settingsForm = document.getElementById('settings-form');
    const usernameInput = document.getElementById('username-input');
    const avatarInput = document.getElementById('avatar-input'); // 追加
    const backBtn = document.getElementById('back-btn');

    // ログイン状態チェック
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
        alert('ログインセッションが切れました。');
        window.location.href = '../login/index.html';
        return;
    }

    const userUID = user.id;

    // データベースから full_name と avatar_url を取得
    const { data: profile, error: selectError } = await supabaseClient
        .from('profiles')
        .select('full_name, avatar_url') // avatar_urlを追加
        .eq('user_id', userUID)
        .single();

    if (selectError) {
        console.error('データ取得エラー:', selectError.message);
        alert('プロファイル情報の取得に失敗しました。');
        return;
    }

    // 入力欄に初期値をセット
    if (profile) {
        usernameInput.value = profile.full_name || '';
        avatarInput.value = profile.avatar_url || ''; // 追加
        loadingMsg.style.display = 'none';
        settingsForm.style.display = 'block';
    }

    // 保存処理
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newName = usernameInput.value.trim();
        const newAvatar = avatarInput.value.trim(); // 追加

        if (!newName) {
            alert('名前を入力してください。');
            return;
        }

        console.log('プロファイルを更新中...');
        
        // full_name と avatar_url を両方アップデート
        const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ 
                full_name: newName,
                avatar_url: newAvatar // 追加
            })
            .eq('user_id', userUID);

        if (updateError) {
            console.error('データ更新エラー:', updateError.message);
            alert('保存に失敗しました: ' + updateError.message);
        } else {
            console.log('保存成功！');
            alert('設定を保存しました！');
        }
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../dashboard/index.html';
        });
    }
});