# React + TypeScript Web Hands-on (3h)

## 必要ツール
- Docker Desktop (または互換コンテナランタイム)
- Visual Studio Code + Dev Containers拡張
- Git / GitHubアカウント
- Node.js 18+ (ローカル確認用)
- ブラウザ (Chrome / Edge など)
- 任意: Vercel / Netlify アカウント (CDデモ用)

## タイムテーブルと詳細手順（配布物なし・ゼロから構築）

重要: このハンズオンでは、開発サーバの公開ポートは競合回避のため最終的に`5173`を使用します（Viteのデフォルト）。以前は`3000`表記でしたが、既存アプリと衝突する場合は`5173`に切り替えてください。

### 0:00-0:20 導入と環境チェック
1. ゴール説明: React + TypeScriptアプリをDocker上で開発し、GitHubとCI/CDまで体験する流れを共有する。
2. 空の作業ディレクトリを作成 (`mkdir react-hands-on && cd react-hands-on`)、VS Codeでフォルダを開く。
3. Gitリポジトリ初期化 (`git init`)、`main`ブランチを作成し初期コミットを想定。
4. 受講者環境のDocker起動確認 (`docker version`)、VS Code Dev Containers拡張のインストール確認。
5. GitHubアカウント権限とPersonal Access Token (PAT) の作成状況を確認。
6. コースの成果物と最終チェックリストを説明。

### 0:20-1:05 DockerコンテナでReact環境構築
1. `Dockerfile`（dev用ベースイメージ）を新規作成（`node:24-alpine`、`corepack enable`、`WORKDIR /workspace`）。
2. `.dockerignore`を用意（`node_modules`/`dist`/`*.log`等を除外）。
3. `docker-compose.yml`を新規作成（`app`サービスで`5173:5173`、ボリュームでソースをマウント、`node_modules`は名前付きボリューム）。
4. 初回ビルド: `docker compose build`を実行（キャッシュやネットワークエラー時の対処共有）。
5. コンテナ起動: `docker compose up -d` → `docker compose exec web sh`でシェルに入る。
6. プロジェクト初期化（コンテナ内）: `npm create vite@latest . -- --template react-ts`（カレント直下に生成）。
7. 依存関係導入: `npm install` / `npm ci`、`npm run dev -- --host 0.0.0.0`で起動確認（デフォルト5173）。
8. `package.json`/`tsconfig.json`/`vite.config.ts`の役割と編集ポイントを解説。
9. ホットリロード、ポートフォワード、ファイル監視（`CHOKIDAR_USEPOLLING`）の意味を説明。

推奨ファイル内容（写経用）:

Dockerfile（例）
```Dockerfile
FROM node:24-alpine
RUN corepack enable
WORKDIR /workspace/app
EXPOSE 5173
# 既定の起動はdocker-compose側で指定
CMD ["sh","-lc","sleep infinity"]
```

.dockerignore
```
node_modules
dist
.DS_Store
npm-debug.log*
yarn-error.log*
.env*
```

docker-compose.yml（例）
```yaml
services:
	app:
		build: .
		ports:
			- "5173:5173"
		environment:
			- CHOKIDAR_USEPOLLING=true
		volumes:
			- .:/workspace
			- node_modules:/workspace/web/node_modules
		working_dir: /workspace/web
		tty: true
		command: sh -lc "npm ci || npm install; npm run dev"

volumes:
	node_modules:
```

### 1:05-1:40 React + TypeScript開発演習（Todoアプリを実装）
機能要件（最小）:
- Todoの追加/完了トグル/削除
- 未了/完了/すべてのフィルタ表示
- ローカル永続化（`localStorage`）

ディレクトリ構成（抜粋）:
```
src/
	components/
		TodoInput.tsx
		TodoItem.tsx
		TodoList.tsx
		FilterBar.tsx
	hooks/
		useTodos.ts
	types/
		todo.ts
	App.tsx
	main.tsx
```

型定義 `src/types/todo.ts`
```ts
export type Todo = {
	id: string;
	title: string;
	completed: boolean;
};
export type Filter = 'all' | 'active' | 'completed';
```

カスタムフック `src/hooks/useTodos.ts`
```ts
import { useEffect, useMemo, useState } from 'react';
import type { Todo, Filter } from '../types/todo';

const STORAGE_KEY = 'todos:v1';

const load = (): Todo[] => {
	try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
	catch { return []; }
};

export const useTodos = () => {
	const [todos, setTodos] = useState<Todo[]>(load());
	const [filter, setFilter] = useState<Filter>('all');

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
	}, [todos]);

	const filtered = useMemo(() => {
		switch (filter) {
			case 'active': return todos.filter(t => !t.completed);
			case 'completed': return todos.filter(t => t.completed);
			default: return todos;
		}
	}, [todos, filter]);

	const add = (title: string) => setTodos(prev => [{ id: crypto.randomUUID(), title, completed: false }, ...prev]);
	const toggle = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
	const remove = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));

	return { todos, filtered, filter, setFilter, add, toggle, remove };
};
```

コンポーネント `src/components/TodoInput.tsx`
```tsx
import { useState, FormEvent } from 'react';

export const TodoInput = ({ onAdd }: { onAdd: (title: string) => void }) => {
	const [title, setTitle] = useState('');
	const submit = (e: FormEvent) => {
		e.preventDefault();
		const v = title.trim();
		if (!v) return;
		onAdd(v);
		setTitle('');
	};
	return (
		<form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
			<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Add todo" />
			<button type="submit">Add</button>
		</form>
	);
};
```

`src/components/TodoItem.tsx`
```tsx
import type { Todo } from '../types/todo';

type Props = { todo: Todo; onToggle: (id: string) => void; onRemove: (id: string) => void };
export const TodoItem = ({ todo, onToggle, onRemove }: Props) => (
	<li style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
		<input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
		<span style={{ textDecoration: todo.completed ? 'line-through' : 'none', flex: 1 }}>{todo.title}</span>
		<button onClick={() => onRemove(todo.id)}>Delete</button>
	</li>
);
```

`src/components/TodoList.tsx`
```tsx
import type { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';

type Props = { todos: Todo[]; onToggle: (id: string) => void; onRemove: (id: string) => void };
export const TodoList = ({ todos, onToggle, onRemove }: Props) => (
	<ul style={{ padding: 0, listStyle: 'none' }}>
		{todos.map(t => (
			<TodoItem key={t.id} todo={t} onToggle={onToggle} onRemove={onRemove} />
		))}
	</ul>
);
```

`src/components/FilterBar.tsx`
```tsx
import type { Filter } from '../types/todo';

type Props = { value: Filter; onChange: (f: Filter) => void };
export const FilterBar = ({ value, onChange }: Props) => (
	<div style={{ display: 'flex', gap: 8 }}>
		{(['all','active','completed'] as const).map(f => (
			<button key={f} disabled={value===f} onClick={() => onChange(f)}>{f}</button>
		))}
	</div>
);
```

`src/App.tsx`
```tsx
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { FilterBar } from './components/FilterBar';
import { useTodos } from './hooks/useTodos';

function App() {
	const { filtered, filter, setFilter, add, toggle, remove } = useTodos();
	return (
		<div style={{ maxWidth: 480, margin: '2rem auto', display: 'grid', gap: 12 }}>
			<h1>Todo</h1>
			<TodoInput onAdd={add} />
			<FilterBar value={filter} onChange={setFilter} />
			<TodoList todos={filtered} onToggle={toggle} onRemove={remove} />
		</div>
	);
}
export default App;
```

起動コマンド（Windows PowerShell）
```powershell
docker compose up -d
docker compose exec app sh -lc "cd /workspace; [ -d web ] || npm create vite@latest web -- --template react-ts"
docker compose exec -w /workspace/web app sh -lc "npm install"
# 以降はcomposeのcommandで自動起動。手動起動する場合:
docker compose exec -w /workspace/web app sh -lc "npm run dev -- --host 0.0.0.0"
```

---

## 実行コマンド集（実際に行った作業と初心者向け解説）

### 1) コンテナをビルド・起動する
```powershell
docker compose build
docker compose up -d
docker compose ps
```
- ビルド: Dockerfileを元に開発用イメージを作ります。
- 起動: コンテナをバックグラウンド起動します。
- 状態確認: コンテナが「Up」かどうかと、ポート公開状況を確認します。

### 2) Vite（React+TS）プロジェクトをコンテナ内に作成する
```powershell
docker compose exec app sh -lc "cd /workspace; [ -d web ] || npm create vite@latest web -- --template react-ts"
docker compose exec -w /workspace/web app sh -lc "npm install"
```
- `npm create vite@latest`: React+TypeScriptの雛形を生成します。`web`というサブフォルダに作成して、ホストとコンテナで同じソースを共有します。
- `npm install`: 依存パッケージをインストールします。初回のみ時間がかかります。

### 3) 開発サーバを起動してブラウザで確認する
```powershell
docker compose logs app --tail 60
(Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing).StatusCode
Start-Process "http://localhost:5173"
```
- `logs`: 起動に失敗していないかを確認します。
- `Invoke-WebRequest`: 200が返ればOK（PowerShellの簡易HTTP確認）。
- ブラウザで`http://localhost:5173`を開いてVite→Todo画面を確認します。

### 4) Todo画面の実装（追加した主なファイル）
- `web/src/types/todo.ts`: Todo型とフィルタの型定義。
- `web/src/hooks/useTodos.ts`: 追加/切替/削除と、localStorage保存を担うカスタムフック。
- `web/src/components/`配下: 入力、一覧、個別項目、フィルタ切替のUI部品。
- `web/src/App.tsx`: 画面をTodo UIに差し替え。フックと各コンポーネントを組み合わせます。

（補足）TypeScriptの型エラー修正例:
```diff
- import { useState, FormEvent } from 'react';
+ import { useState } from 'react';
+ import type { FormEvent } from 'react';
```
`verbatimModuleSyntax`有効時はタイプのみ`import type`を書くとエラーが解消します。

### 5) ビルド（型チェック込み）
```powershell
docker compose exec -w /workspace/web app npm run build
```
- TypeScriptの型チェックと本番用バンドル（`dist/`）を生成します。エラーが出ればコードや型の修正が必要です。

### 6) ポート競合に遭遇したときの対処（今回の実例）
```powershell
# 3000番が別アプリ（Langfuseなど）に占有されているか調査
curl.exe -I http://localhost:3000
Get-NetTCPConnection -LocalPort 3000 -State Listen |
	Select-Object -Unique OwningProcess |
	ForEach-Object { Get-Process -Id $_.OwningProcess | Format-Table Id,ProcessName,Path -Auto }
wsl -e sh -lc "ss -ltnp | grep :3000 || true"

# 回避策: Viteをデフォルトの5173に寄せる（composeのportsを5173:5173に）
docker compose down --remove-orphans
docker compose up -d
(Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing).StatusCode
```
- 調査: `curl -I`でヘッダを見ると別サイト（Langfuse）と判別できることがあります。
- WSL確認: `ss -ltnp`でWSL内のポート利用状況を確認できます。
- 変更: `5173:5173`に切り替えると衝突を避けられます（Viteのデフォルト）。

### 7) 再起動の定石
```powershell
docker compose down --remove-orphans
docker compose up -d
docker compose ps
docker compose logs app --tail 80
```
- `down`/`up`: クリーンに落として立ち上げ直すのが一番早い復旧手段です。
- `ps`/`logs`: 稼働とログにエラーが無いかを確認します。

### 1:40-2:20 GitHub連携とPull Requestフロー
1. Git初期設定: `git config user.name`, `git config user.email`を確認。
2. リモートリポジトリ作成 (GitHub Web UI)、`git remote add origin <url>`で紐付け。
3. ブランチ戦略: `main`保護、`feature/xxxx`ブランチ作成例 (`git checkout -b feature/add-todo-component`)。
4. 変更ステージングとコミット: `git status`, `git add`, `git commit -m "feat: add todo component"`。
5. `git push -u origin feature/add-todo-component`でリモート送信。
6. GitHub上でPull Request作成、PRテンプレートの導入例を提示。
7. コードレビューコメントのやり取りと修正コミット (`git commit --amend` と `git push --force-with-lease` の比較) を実演。
8. Merge戦略 (Squash / Rebase / Merge) のメリット・デメリット整理。

### 2:20-3:00 CI/CD入門とデプロイデモ
1. GitHub Actions概要: ワークフローYAMLの構造 (trigger, jobs, steps) を説明。
2. `.github/workflows/ci.yml`作成: `on: pull_request`, `jobs: lint_test_build`など。
3. Nodeセットアップ (`actions/setup-node@v4`) とキャッシュ (`actions/cache`) の使い方解説。
4. `npm ci`, `npm run lint`, `npm test -- --watch=false`, `npm run build` の順でCIステップ実装。
5. ブランチ保護ルールでPR前にCI通過を必須にする手順をGitHub設定画面で説明。
6. CDの概念紹介: Vercel/Netlify/GitHub Pagesいずれかを例に、`npm run build`成果物を使った自動デプロイフローを紹介。
7. GitHub Actionsでデプロイトリガー (`on: push` to `main`) を追加する応用例を議論。
8. コースまとめ: 次のステップ (本番運用監視、StorybookやE2Eテスト導入など) を提案。

写経用 CI サンプル `.github/workflows/ci.yml`
```yaml
name: CI
on:
	pull_request:
		branches: [ main ]
jobs:
	build:
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v4
			- uses: actions/setup-node@v4
				with:
					node-version: '20'
					cache: 'npm'
			- run: npm ci
			- run: npm run lint --if-present
			- run: npm test -- --watch=false --run
			- run: npm run build
```

（任意）GitHub Pages でのCDイメージ：
- `npm i -D gh-pages`、`package.json`に`"predeploy":"npm run build","deploy":"gh-pages -d dist"`を追加。
- リポ設定→Pagesで`gh-pages`ブランチを公開に設定。

## 参考資料
- React公式ドキュメント: https://react.dev/
- TypeScriptハンドブック: https://www.typescriptlang.org/docs/
- Docker公式ドキュメント: https://docs.docker.com/
- GitHub Actionsガイド: https://docs.github.com/actions
- Vercelドキュメント: https://vercel.com/docs

---

付録: 品質基盤の最小設定

ESLint/Prettier 導入（Viteテンプレに追加）
```powershell
docker compose exec web sh -lc "npm i -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier prettier"
```

`.eslintrc.cjs`
```js
module.exports = {
	root: true,
	env: { browser: true, es2021: true, node: true },
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
};
```

`.prettierrc`
```json
{
	"singleQuote": true,
	"semi": true
}
```

`package.json`にスクリプト
```json
{
	"scripts": {
		"lint": "eslint \"src/**/*.{ts,tsx}\"",
		"test": "vitest"
	}
}
```

テスト（Vitest + RTL）
```powershell
docker compose exec web sh -lc "npm i -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom"
```

`vite.config.ts`に`test`設定を追加
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: './src/test/setup.ts'
	}
});
```

`src/test/setup.ts`
```ts
import '@testing-library/jest-dom';
```

サンプルテスト `src/components/TodoItem.test.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem';

test('toggle and delete buttons work', async () => {
	const user = userEvent.setup();
	const onToggle = vi.fn();
	const onRemove = vi.fn();
	render(<TodoItem todo={{ id: '1', title: 'A', completed: false }} onToggle={onToggle} onRemove={onRemove} />);
	await user.click(screen.getByRole('checkbox'));
	expect(onToggle).toHaveBeenCalledWith('1');
	await user.click(screen.getByRole('button', { name: /delete/i }));
	expect(onRemove).toHaveBeenCalledWith('1');
});
```

---

付録: トラブルシュートとチェックポイント

チェックポイント（各フェーズ完了の目安）
- 環境: `docker compose up -d`でコンテナがヘルシー。`docker compose exec web node -v`が動く。
- 起動: `http://localhost:5173`でViteのページ→Todo画面に差し替え済み。
- 検証: `npm run lint`にエラーなし、`npm test`が成功、`npm run build`が成功。
- Git/PR: ブランチ作成→PR作成→レビューコメント反映→マージ。
- CI: PRでActionsが自動実行し、lint/test/buildが緑。

よくある詰まりと対処
- ポート競合: 3000が使用中→`docker compose down`や`ports`で`3001:3000`に変更。
- ホットリロードしない: Windows/VM環境は`CHOKIDAR_USEPOLLING=true`で改善。ボリュームマウントを再確認。
- コンテナ起動直後に落ちる: `package.json`未作成が原因→`Dockerfile`のフォールバックで`sleep infinity`になっているかを確認し、`npm create vite@latest`を実行。
- 権限/パーミッション: `node_modules`はボリューム分離で回避。うまく行かない場合は`docker compose down -v`で再作成。
- Nodeバージョン差異: CIはNode 20を使用。ローカルは`node:24-alpine`ベースでも問題ないが、互換性エラー時はCI側のNodeバージョンに合わせる。
- GitHubへのpush認証失敗: PAT/SSH設定を再確認。2FA有効時はトークンを利用。
