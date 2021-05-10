# AWS 料金チェック

制限がありCLI等から請求情報が取得できない環境向けに、管理コンソールをスクレイピングして  
請求情報を取得するプログラム。

## 処理に付いて

毎日 日本時間 8:00 に起動。管理コンソールをスクレイピングして請求情報を通知する。

### 処理詳細

スクレイピングの課程 および 結果は以下のように利用される。

- S3

  - 管理コンソールの画面キャプチャーを保存
  - 7 日間で削除される

- DynamoDB

  - 収集した以下のコスト情報を蓄積
    - 総計(total)
    - 月末の金額予測(forecast)
    - サービス毎の金額
  - レコードの有効期間は 1 年に設定

- SES
  - 指定された送信先アドレスに対して 以下の内容をメール送信する。
    - 処理時点の総計(Total)
    - 月末の金額予測(Forecast)
  - 換算レートは SEC の固定レートを利用

## 開発/デプロイを行う環境の前提

- AWS クレデンシャルが設定されていること
- Node.JS v12 がインストールされていること
- `awscli`コマンドが利用できること (例: `pip install awscli`)
- `awslogs`コマンドが利用できること (例: `pip install awslogs`)
- `yq`コマンドが利用できること (例: `pip install yq`)

## ローカル開発

### 開発用の環境変数の設定

開発で利用する以下の環境変数を設定する。

| 環境変数                 | 説明                                        |
| ------------------------ | ------------------------------------------- |
| MANAGED_CONSOLE_URL      | 管理コンソールの URL                        |
| MANAGED_CONSOLE_USER     | 管理コンソールにログインする際のユーザー ID |
| MANAGED_CONSOLE_PASSWORD | 管理コンソールにログインする際のパスワード  |
| TO_ADDRESSES             | 送信先メールアドレス(カンマ区切り)          |
| TABLE                    | DynamoDB テーブル名                         |
| PARAM_STORE_HIERARCHY    | ParameterStore のキー階層プレフィックス     |
| BUCKET                   | スクリーンショット保存用の s3 バケット名    |

### LocalStack の準備

ローカルでは AWS 環境は利用せず、`LocalStack`を使用して開発を行う。  
以下の手順で`LocalStack`環境をセットアップする。

#### 起動

```sh
cd <project root>/lambda
docker-compose up -d
```

#### 初期設定

```sh
cd <project root>/lambda
bash scripts/setup-localstack.sh
```

### 開発作業

#### VSCode の起動

`lambda`フォルダに移動してから VSCode を起動する。

#### TaskRunner の実行

この開発環境では TypeScript のトランスパイルは VSCode の TaskRunner に行わせることを前提にしている。  
以下の手順で TaskRunner を実行する。

- F1 > `run task`と入力して`Run Build Task`を選択 > tsc:watch - tsconfig.json を選択

#### ユニットテスト

```sh
cd <project root>/lambda

# 全テスト
yarn test

# 単一ファイル
yarn test [テストファイル名プレフィックス]
```

#### [制限事項 10/29 時点] 請求額を取得する Puppeteer 処理を修正する場合

- `get-current-billing.spec`のテストが通らない

  - 一気通貫のテスト。
  - 管理コンソールのログイン画面のキャプチャー画像を、LocalStack 上の S3 に保存するところで以下のエラーになる。
  - LocalStack の S3 が見つからない理由がよく分からない。

  ```sh
  UnknownEndpoint: Inaccessible host: `cost-check-local.localhost'.
  This service may not be available in the `ap-northeast-1' region.
  ```

## デプロイ

### 概要

Lambda 上でスクレイピングする際 Chrome を利用するが、素の Lambda 環境には  
Chrome がインストールされていない。そのため 以下のモジュールを利用する。

- [chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda)を利用する必要がある。

この npm モジュールはサイズが大きく、Lambda のデプロイパッケージ容量制限に抵触する可能性があるため  
Lambda Layers を利用する

#### デプロイ用の環境変数の設定

デプロイで利用する以下の環境変数を設定する。

| 環境変数                 | 説明                                        |
| ------------------------ | ------------------------------------------- |
| STAGE                    | デプロイする環境名                          |
| MANAGED_CONSOLE_URL      | 管理コンソールの URL                        |
| MANAGED_CONSOLE_USER     | 管理コンソールにログインする際のユーザー ID |
| MANAGED_CONSOLE_PASSWORD | 管理コンソールにログインする際のパスワード  |

#### ParameterStore への登録

管理コンソールのアクセス情報をパラメータストアに格納する。

```sh
cd <project root>/lambda
bash scripts/setup-aws.sh
```

#### Lambda Layers(chrome-aws-lambda)のデプロイ

```sh
cd <project root>/layers
yarn install

export STAGE=<環境名>
yarn deploy
```

#### Lambda 本体のデプロイ

```sh
cd <project root>/lambda
yarn install

export STAGE=<環境名>
yarn deploy
```

#### Lambda のテスト実行

- CloudWatch ログの Tail

```sh
cd <project root>/lambda
export STAGE=<環境名>

awslogs get -wGS /aws/lambda/cost-check-${STAGE}
```

- Lambda のテスト実行 (ログの Tail とは別のターミナルで実行)

```sh
cd <project root>/lambda
export STAGE=<環境名>

sls invoke --stage ${STAGE} --function CostCheck --path events/schedule.json
```

## 送信先メールアドレス

メール送信に利用している SES はサンドボックス環境の状態なので、送信元/送信先に指定するメールアドレスは  
全て検証(Verify)を行う必要があります。

### 利用するメールアドレスの登録

```sh
cd <project root>/lambda
bash scripts/regist-email.sh <メールアドレス1> <メールアドレス2> ...
```

### メールアドレスの検証

上で登録したメールアドレス宛に AWS から以下のような件名のメールが来るので、メール内リンクをクリックする。

- Amazon Web Servivce - Email Aaddress Verification Request in region xxxxx

### 送信先アドレスの追加

`serverless.yml`の`custom.toAddresses.<環境名>`にアドレスを追加する。

---

## 環境の削除

- `ScreenshotBucket`の削除
  - データが残っていると`sls remove`が失敗するので、先に手動で削除する必要あり。
- Lambda の削除
  - `STAGE`環境変数が設定されていることを確認し、`cd lambda && sls remove`
- Layer の削除
  - `STAGE`環境変数が設定されていることを確認し、`cd layers && sls remove`
- Layer データの削除
  - `sls remove`しても、Layer データは消えないので、Lambda の管理コンソールから対象の Layer データを削除する。
- Parameter Store データの削除
  - スクリプトで登録した Parameter Store データを削除する。
- デプロイ用バケット ×2 を削除する
  - `sls remove`しても、デプロイ用バケットは削除されないので、手動で削除する。
