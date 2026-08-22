# Singlish, lah.

A small Singlish glossary for Japanese expats living and working in Singapore — plain HTML/CSS/JS, no build step, deployed on GitHub Pages.

日本語版は下に記載しています (Japanese version below).

## What this is

Terms and phrases collected from everyday life in Singapore — some well-known Singlish staples, some picked up in real conversations and looked up afterward. Content is in Japanese, aimed at Japanese-speaking residents.

Data lives in [`data/terms.json`](data/terms.json); the site is a static search/filter UI over it.

## Running locally

No build tools needed — just serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## License

MIT — see [LICENSE](LICENSE).

---

## これは何か（日本語）

シンガポールで暮らす・働く日本人駐在員向けの、実用シングリッシュ用語集です。定番のシングリッシュ表現に加えて、実際の会話の中で遭遇して意味を調べた表現もまとめています。

ビルド不要のシンプルな静的サイト（HTML/CSS/JS）で、GitHub Pagesでそのまま公開しています。用語データは [`data/terms.json`](data/terms.json) にあり、新しい表現に出会うたびに追記していく予定です。

ニッチすぎて誰得だけど、自分用に作ったのでついでに公開してます。
