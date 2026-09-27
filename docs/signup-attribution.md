# 会員の流入元データ

## 格納先

流入元は Cognito のカスタム属性ではなく、会員プロフィールと同じ DynamoDB テーブルに格納します。
テーブル名はサーバー環境変数 `USER_TABLE` で指定し、未設定時は `yasukariUserMain` です。パーティションキーは
`user_id`（Cognito ID token の `sub`）です。

| UTM パラメーター | DynamoDB 属性 |
| --- | --- |
| `utm_source` | `signup_source` |
| `utm_campaign` | `signup_campaign` |
| `utm_medium` | `signup_medium` |
| `utm_content` | `signup_content` |
| `utm_term` | `signup_term` |
| 保存日時 | `signup_at` |

最初の UTM 付きアクセスをブラウザー Cookie に一時保存し、Cognito 認証完了後に
`/api/auth/signup-attribution` が DynamoDB に保存します。各属性は `if_not_exists` で更新するため、
最初に記録した流入元を後続ログインで上書きしません。保存成功後は、共有端末で別の会員へ同じ流入元を
誤って付与しないよう一時 Cookie を削除します。

## 管理画面の参照先

`/admin/dashboard/members` は Cognito のユーザー一覧と、同じ `USER_TABLE` の全レコードを `user_id` / `sub`
で結合します。「流入元」列には `signup_source` と `signup_campaign` を ` / ` で連結して表示します。
上部の流入元別集計と全会員 CSV も、この結合後の同じデータを使用します。
