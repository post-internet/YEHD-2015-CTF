# YEHD 2015 CTF
NCC恒例 Year End's Hack Day の CTF用レポジトリです．

## 注意事項
- 内部には問題見えますが解かないこと

## ディレクトリ構造

### フォルダ名について
- フォルダ名は``Category-000-QuestionName``
- Categoryがカテゴリ 例）``Web``
  - ``/[a-zA-Z]+/``（アルファベットのみ）
  - Case-insensitive
- 000が得点（3桁，足りなければ0埋め）
  - ``/\d{3}/``（算用数字のみ）
- QuestionNameは問題名（日本語可）

### フォルダ内に必要なもの
- README.md
  - 問題をMarkdown形式で書く
  - 見出しにタイトル・カテゴリ・点数は **必須**
    - 問題表示時には **自動挿入されない**
  - リンクは **相対パスで書くこと**
- flag.sha3-512
  - フラグをSHA3-512でハッシュ化したもの
    - [SHA3-512 Online](http://emn178.github.io/online-tools/sha3_512.html)
    - [rhash/RHash](https://github.com/rhash/RHash)
    - **Keccakとは違うので留意すること**
  - フラグに **改行を含めないように気をつけること**
    - ``echo -n "YEHD{FLAG}"``

### ディレクトリ構造 図解
```
YEHD-2015-CTF/
  |--- Binary-100-Overflow
  |   |- README.md
  |   |- flag.sha3-512
  |   |- q.exe
  |
  |--- Misc-050-HelloWorld
  |   |- README.md
  |   |- flag.sha3-512
  |   |- file.dat
  |
  |--- Web-500-JavaScript
      |- README.md
      |- flag.sha3-512
```

## フラグの形式
- ``YEHD{FLAG}``
- FLAGの部分は自由にしてよい
  - ただし，ASCII文字（``}``を除く）に限る
