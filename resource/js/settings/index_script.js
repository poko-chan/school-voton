// 1. Supabaseの初期設定
const SUPABASE_URL = 'https://aflmhkxgoxnwxerzhkqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbG1oa3hnb3hud3hlcnpoa3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDgsImV4cCI6MjA5NjUzMjc0OH0.zbs5qIWSULf3CKqTdLzXYm3FG-wT13KHsapnzDaHYnM';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const loadingMsg = document.getElementById('loading-msg');
    const settingsForm = document.getElementById('settings-form');
    const usernameInput = document.getElementById('username-input');
    const backBtn = document.getElementById('back-btn');

    // 2. ログイン状態のチェック
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
        console.error('認証エラー、またはセッションがありません:', authError);
        alert('ログインセッションが切れました。ログイン画面に戻ります。');
        window.location.href = '../login/index.html';
        return;
    }

    const userUID = user.id;

    // 3. データベース（profiles）から現在のユーザー情報を取得 (SELECT)
    // ※先ほど作成したSELECTポリシーがここで役に立ちます！
    const { data: profile, error: selectError } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('user_id', userUID)
        .single();

    if (selectError) {
        console.error('データ取得エラー:', selectError.message);
        alert('プロファイル情報の取得に失敗しました。');
        return;
    }

    // 現在の名前を入力欄にセットし、フォームを表示する
    if (profile) {
        usernameInput.value = profile.full_name || '';
        loadingMsg.style.display = 'none';
        settingsForm.style.display = 'block';
    }

    // 4. 「設定を保存」ボタン（フォーム送信）の処理 (UPDATE)
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 画面のリロードを防ぐ
        
        const newName = usernameInput.value.trim();
        if (!newName) {
            alert('名前を入力してください。');
            return;
        }

        console.log('プロファイルを更新中...');
        
        // データベースのフルネームを更新
        const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ full_name: newName })
            .eq('user_id', userUID); // 自分のUIDの行を狙い撃ち

        if (updateError) {
            console.error('データ更新エラー:', updateError.message);
            alert('保存に失敗しました: ' + updateError.message);
        } else {
            console.log('保存成功！');
            alert('設定を保存しました！');
        }
    });

    // 5. 「ダッシュボードに戻る」ボタンの処理
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../dashboard/index.html';
        });
    }
});