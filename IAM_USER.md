# ツール利用に必要な IAM ユーザー

## チェック用ユーザー

- 日々のチェックで利用する IAM ユーザー。
- 管理コンソールをスクレイピングするため、UI でのアクセスが必要。
- ツールを利用する限り有効化しておく必要がある。

### アクセスの種類

- 「AWS マネージメントコンソールアクセス」のみ

### 必要な権限

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ViewBillingOnly",
      "Effect": "Allow",
      "Action": "aws-portal:ViewBilling",
      "Resource": "*"
    }
  ]
}
```

## デプロイ用ユーザー

- デプロイ時に利用する IAM ユーザー。
- CLI を利用したアクセスしか行わないので、UI でのアクセスは不要。
- デプロイ後は削除してもよい。

### アクセスの種類

- 「プログラムによるアクセス」のみ

### 必要な権限

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormation",
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:Describe*",
        "cloudformation:ValidateTemplate",
        "cloudformation:UpdateStack",
        "cloudformation:List*",
        "cloudformation:DeleteStack"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAM",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:PassRole",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:CreateServiceLinkedRole",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:AttachRolePolicy",
        "iam:DeleteRolePolicy"
      ],
      "Resource": "*"
    },
    {
      "Sid": "UseResources",
      "Effect": "Allow",
      "Action": [
        "logs:*",
        "ses:*",
        "s3:*",
        "ssm:*",
        "dynamodb:*",
        "lambda:*",
        "events:*"
      ],
      "Resource": "*"
    }
  ]
}
```
