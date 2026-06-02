# AGENTS.md

## Project Rules

このリポジトリで作業するCodexおよび開発エージェントは、以下のルールに従ってください。

## 技術制約

- Unity、Godot、Unreal、Phaser、PixiJS、Kaboom.js、その他ゲームエンジン／ゲームフレームワークを使用しない。
- TypeScript、Vite、HTML Canvas 2D API、DOM UI、CSS、localStorage を基本とする。
- Canvas描画、DOM UI、ゲームロジック、データ、セーブ処理、アニメーション処理を分離する。
- 仕様書にない大規模機能を勝手に追加しない。
- MVP完成を優先し、将来拡張はデータ構造と設計余地に留める。

## 作業ルール

- 1タスク1ブランチ、1タスク1PRを原則とする。
- 変更は小さく、レビュー可能な単位に分ける。
- 進捗変更時は `docs/PROGRESS.md` を更新する。
- 仕様判断をした場合は `docs/DECISIONS.md` に記録する。
- バグまたは未解決事項を見つけた場合は `docs/BUGS.md` に記録する。
- アセット生成プロンプトは `docs/asset-prompts/` に保存する。
- 画像アセットは `public/assets/generated/` 以下に用途別に保存する。
- 画像読み込みに失敗しても、代替図形でゲームが止まらないようにする。

## 実装上の重要方針

- 味方側はMVPではひめ1人だが、内部的には `partyMembers: BattleActor[]` で管理する。
- 敵側は `enemies: BattleActor[]` で管理する。
- 敵シンボルは `enemyId` ではなく `encounterId` を持つ。
- `EncounterData` により、1体または2体の敵を生成できるようにする。
- MVPでは1対3以上の戦闘は実装しない。
- 攻撃カードで敵が複数いる場合は、ターゲット選択UIを出す。
- 回復・防御カードはMVPではひめ自身に自動適用する。
- ボス戦はカゲマサ1体とする。

## 検証

可能な限り以下を実行し、結果を `docs/PROGRESS.md` に記録する。

- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run dev`







